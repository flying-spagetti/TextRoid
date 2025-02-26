from flask import Flask, request, jsonify
import psutil
import time
import logging
import gc
import torch
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from transformers import AutoModelForCausalLM, AutoModelForQuestionAnswering, AutoTokenizer
from transformers import pipeline

# CPU optimization settings
os.environ["OMP_NUM_THREADS"] = "4"  # Optimize OpenMP threads for i7
os.environ["MKL_NUM_THREADS"] = "4"  # Math Kernel Library threads
torch.set_num_threads(4)  # Set PyTorch threads

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Flask limiter with more restrictive limits to prevent resource exhaustion
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["15 per day", "3 per hour"],
    storage_uri="memory://",
)

# Global variables for models and tokenizers
completion_model = None
qa_model = None
completion_tokenizer = None
qa_tokenizer = None
model_status = "Not initialized"
start_time = time.time()

# Model initialization with optimizations
def initialize_models():
    global completion_model, qa_model, completion_tokenizer, qa_tokenizer, model_status
    
    try:
        logger.info("Initializing models with optimizations...")
        
        # Load completion model with optimizations
        completion_tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")
        completion_model = AutoModelForCausalLM.from_pretrained(
            "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            torch_dtype=torch.float32,  # Use FP32 for CPU
            low_cpu_mem_usage=True
        )
        # Force model to CPU mode and apply optimizations
        completion_model = completion_model.to("cpu")
        # Use pipeline with optimized model
        completion_pipeline = pipeline(
            "text-generation", 
            model=completion_model, 
            tokenizer=completion_tokenizer,
            device=-1  # Ensure CPU
        )
        
        # Load QA model with similar optimizations
        qa_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-cased-distilled-squad")
        qa_model = AutoModelForQuestionAnswering.from_pretrained(
            "distilbert-base-cased-distilled-squad",
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True
        )
        qa_model = qa_model.to("cpu")
        qa_pipeline = pipeline(
            "question-answering", 
            model=qa_model, 
            tokenizer=qa_tokenizer,
            device=-1
        )
        
        # Replace globals with pipelines
        completion_model = completion_pipeline
        qa_model = qa_pipeline
        
        # Run garbage collection to clean up
        gc.collect()
        torch.cuda.empty_cache()  # Just in case
        
        model_status = "Models loaded successfully with CPU optimizations"
        logger.info(model_status)
        
        # Log memory usage after loading
        ram = psutil.virtual_memory()
        logger.info(f"RAM after model loading: {ram.percent}% used, {ram.available / (1024**3):.2f}GB available")
        
    except Exception as e:
        logger.error(f"Error initializing models: {str(e)}")
        model_status = f"Model loading failed: {str(e)}"
        # Ensure models are None if initialization fails
        completion_model = None
        qa_model = None

# Initialize models at startup
initialize_models()

# Batch processing function to handle multiple requests efficiently
def process_completion_batch(texts, max_length=50):
    results = []
    for text in texts:
        try:
            # Apply model-specific optimizations
            inputs = completion_tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
            with torch.no_grad():  # Disable gradient calculation for inference
                result = completion_model(
                    text, 
                    max_length=max_length, 
                    num_return_sequences=1,
                    pad_token_id=completion_tokenizer.eos_token_id
                )
            results.append(result[0]['generated_text'])
        except Exception as e:
            logger.error(f"Error in batch processing: {str(e)}")
            results.append(f"Error: {str(e)}")
    return results

@limiter.limit("3 per minute")  # Further restrict to prevent overload
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'task_type' not in data:
            return jsonify(error="Invalid input, 'task_type' is required"), 400

        task_type = data['task_type']
        
        # Monitor memory before processing
        mem_before = psutil.virtual_memory().percent
        logger.info(f"Memory usage before processing: {mem_before}%")

        if task_type == "completion":
            if not completion_model:
                return jsonify(error="Completion model is not available"), 500
            if 'text' not in data:
                return jsonify(error="Missing 'text' for completion"), 400
                
            text = data['text']
            # Limit input length to prevent memory issues
            if len(text) > 1000:
                text = text[:1000] + "..."
                
            # Use more conservative parameters for CPU
            max_length = min(data.get('max_length', 50), 100)  # Cap maximum output length
            
            result = completion_model(
                text, 
                max_length=max_length, 
                num_return_sequences=1,
                do_sample=True,
                temperature=0.7,  # Lower temperature for faster inference
                top_p=0.9
            )
            response = result[0]['generated_text']

        elif task_type == "qa":
            if not qa_model:
                return jsonify(error="QA model is not available"), 500
            if 'context' not in data or 'question' not in data:
                return jsonify(error="Missing 'context' or 'question' for QA"), 400
            
            context = data['context']
            # Limit context length to prevent memory issues
            if len(context) > 2000:
                context = context[:2000] + "..."
                
            question = data['question']
            result = qa_model(question=question, context=context)
            response = result.get('answer', 'No answer found')

        else:
            return jsonify(error="Invalid task type"), 400

        # Monitor memory after processing
        mem_after = psutil.virtual_memory().percent
        logger.info(f"Memory usage after processing: {mem_after}%")
        
        # Run garbage collection if memory usage is high
        if mem_after > 80:
            logger.warning("High memory usage detected, running garbage collection")
            gc.collect()
            torch.cuda.empty_cache()
        
        return jsonify(response=response)

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        return jsonify(error=f"Prediction failed: {str(e)}"), 500

@app.route('/health', methods=['GET'])
def health():
    uptime = time.time() - start_time
    cpu_usage = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    memory_usage = memory.percent
    available_memory_gb = memory.available / (1024**3)
    
    # Only run a quick model check, not full inference
    model_check = "Models not tested"
    if completion_model and qa_model:
        try:
            # Lightweight model check without full inference
            if hasattr(completion_model, "tokenizer") and completion_tokenizer:
                model_check = "Models appear to be loaded"
            else:
                model_check = "Models may not be fully initialized"
        except Exception as e:
            model_check = f"Model issue detected: {str(e)}"
    
    return jsonify(
        status="healthy",
        model_status=model_status,
        model_check=model_check,
        cpu_usage=f"{cpu_usage}%",
        memory_usage=f"{memory_usage}%",
        available_memory_gb=f"{available_memory_gb:.2f} GB",
        uptime=f"{int(uptime)} seconds"
    )

@app.route('/reload_models', methods=['POST'])
@limiter.limit("1 per hour")  # Prevent abuse of this endpoint
def reload_models():
    try:
        # Clean up existing models
        global completion_model, qa_model
        completion_model = None
        qa_model = None
        
        # Run garbage collection
        gc.collect()
        torch.cuda.empty_cache()
        
        # Reinitialize
        initialize_models()
        
        return jsonify(status="Models reloaded", model_status=model_status)
    except Exception as e:
        return jsonify(error=f"Model reload failed: {str(e)}"), 500

if __name__ == '__main__':
    # Use gunicorn or another production server in real deployment
    # This is just for development
    app.run(host='0.0.0.0', port=5000, threaded=False, processes=3)