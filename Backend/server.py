from flask import Flask, request, jsonify
from transformers import pipeline
import psutil
import time
import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["20 per day", "5 per hour"],
)

# Load models once at startup
start_time = time.time()
try:
    logger.info("Initializing models...")  # Fix: Move logging outside request context
    completion_model = pipeline("text-generation", model="gpt2")
    qa_model = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")
    model_status = "Models loaded successfully"
except Exception as e:
    logger.error("Error: %s", str(e))
    model_status = f"Model loading failed: {str(e)}"
    completion_model = None  # Prevent referencing undefined variables
    qa_model = None

@limiter.limit("5 per minute")
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data or 'task_type' not in data:
            return jsonify(error="Invalid input, 'task_type' is required"), 400

        task_type = data['task_type']

        if task_type == "completion":
            if not completion_model:
                return jsonify(error="Completion model is not available"), 500
            if 'text' not in data:
                return jsonify(error="Missing 'text' for completion"), 400
            text = data['text']
            result = completion_model(text, max_length=50, num_return_sequences=1)
            response = result[0]['generated_text']

        elif task_type == "qa":
            if not qa_model:
                return jsonify(error="QA model is not available"), 500
            if 'context' not in data or 'question' not in data:
                return jsonify(error="Missing 'context' or 'question' for QA"), 400
            
            context = data['context']   
            question = data['question']
            result = qa_model(question=question, context=context)
            response = result.get('answer', 'No answer found')

        else:
            return jsonify(error="Invalid task type"), 400

        return jsonify(response=response)

    except Exception as e:
        return jsonify(error=f"Prediction failed: {str(e)}"), 500

@app.route('/health', methods=['GET'])
def health():
    uptime = time.time() - start_time
    cpu_usage = psutil.cpu_percent(interval=1)
    memory_usage = psutil.virtual_memory().percent
    
    try:
        if completion_model:
            completion_model("Hello", max_length=10, num_return_sequences=1)
        if qa_model:
            qa_model(question="What is AI?", context="AI stands for Artificial Intelligence.")
        model_check = "Models responding normally"
    except Exception as e:
        model_check = f"Model issue detected: {str(e)}"
    
    return jsonify(
        status="healthy",
        model_status=model_status,
        model_check=model_check,
        cpu_usage=f"{cpu_usage}%",
        memory_usage=f"{memory_usage}%",
        uptime=f"{int(uptime)} seconds"
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
