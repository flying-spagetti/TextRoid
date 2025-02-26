"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, RefreshCw, Info, Zap, History, Trash2, BrainCog, X, MessageSquare, Copy, Check } from "lucide-react"
import { generateAIResponse } from "../app/actions/chat"

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

type ModelInfo = {
  name: string;
  description: string;
  icon: React.ReactNode;
  capabilities: string[];
}

export default function Demo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [task, setTask] = useState<"completion" | "qa">("completion")
  const [isTyping, setIsTyping] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState([
    "Thinking...",
    "Generating response...",
    "Processing with AI...",
    "Almost there...",
    "Analyzing patterns...",
  ]);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const models: Record<string, ModelInfo> = {
    completion: {
      name: "GPT-2",
      description: "A transformer-based language model that generates coherent and contextually relevant text completions.",
      icon: <Zap className="w-5 h-5" />,
      capabilities: [
        "Completes partial text inputs",
        "Generates creative content",
        "Maintains coherent context",
        "Works with various text styles"
      ]
    },
    qa: {
      name: "BERT",
      description: "A bidirectional transformer model specialized in understanding context to provide accurate answers to questions.",
      icon: <BrainCog className="w-5 h-5" />,
      capabilities: [
        "Extracts answers from context",
        "Understands natural language questions",
        "Identifies relevant information",
        "Provides concise answers"
      ]
    }
  }

  const examplePrompts = {
    completion: [
      "Once upon a time in a distant galaxy",
      "The future of artificial intelligence will",
      "If I could change one thing about technology",
      "The most fascinating discovery in recent years"
    ],
    qa: [
      "What is artificial intelligence?",
      "How does GPT-2 differ from BERT?",
      "What tasks require human intelligence?",
      "How do language models learn?"
    ]
  }

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])
  
  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Generate a random ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { 
      id: generateId(), 
      role: "user", 
      content: input,
      timestamp: new Date() 
    }
    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput("")
    setIsTyping(true)
    setCurrentLoadingMessageIndex(0)

    // Cycle through loading messages
    const loadingInterval = setInterval(() => {
      setCurrentLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 800)

    try {
      // Call the server action to generate AI response
      const aiResponseText = await generateAIResponse(task, userInput)
      
      // Add the AI response to messages
      setMessages((prev) => [...prev, { 
        id: generateId(),
        role: "ai", 
        content: aiResponseText,
        timestamp: new Date()
      }])
    } catch (error) {
      // Handle errors
      console.error("Error generating AI response:", error)
      setMessages((prev) => [...prev, { 
        id: generateId(),
        role: "ai", 
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date()
      }])
    } finally {
      clearInterval(loadingInterval)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
    inputRef.current?.focus()
  }

  const clearMessages = () => {
    setMessages([])
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 drop-shadow-lg font-pj">
            AI Playground
          </h2>
          <button 
            onClick={() => setShowInfo(!showInfo)} 
            className="ml-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Show model information"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">About the Models</h3>
              <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(models).map(([key, model]) => (
                <div key={key} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center mb-2">
                    {model.icon}
                    <h4 className="ml-2 font-bold">{model.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                  <h5 className="text-sm font-semibold mb-1">Capabilities:</h5>
                  <ul className="text-sm text-gray-600 pl-5 list-disc">
                    {model.capabilities.map((capability, i) => (
                      <li key={i}>{capability}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-100 border-b border-gray-200">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                task === "completion" ? "bg-gray-900 text-white hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
              }`}
              onClick={() => setTask("completion")}
            >
              <Zap className="w-4 h-4 mr-2" />
              GPT-2 (Text Completion)
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                task === "qa" ? "bg-gray-900 text-white hover:bg-gray-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
              }`}
              onClick={() => setTask("qa")}
            >
              <BrainCog className="w-4 h-4 mr-2" />
              BERT (Question Answering)
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <History className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium">{messages.length > 0 ? messages.length : 'No'} messages</span>
            </div>
            {messages.length > 0 && (
              <button 
                onClick={clearMessages}
                className="text-sm flex items-center text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear chat
              </button>
            )}
          </div>

          <div className="h-[380px] overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">Start a conversation</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Select a model and enter a prompt to see the AI in action
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {examplePrompts[task].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="text-sm text-left p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-100 transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4 }}
                  className={`mb-6 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                >
                  <div className="max-w-[85%]">
                    <div className="flex items-start mb-1">
                      <div
                        className={`p-4 rounded-lg shadow-sm ${
                          message.role === "user" ? "bg-gray-900 text-white" : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        {message.content}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Copy to clipboard"
                      >
                        {copiedId === message.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`text-xs text-gray-500 ${message.role === "user" ? "text-right mr-2" : "ml-2"}`}>
                      {message.role === "user" ? "You" : models[task].name} • {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex items-start mb-6"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                    <span className="text-gray-700">{loadingMessages[currentLoadingMessageIndex]}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-2 mt-1">
                    {models[task].name} is responding...
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={task === "completion" ? 
                  "Enter text for GPT-2 to complete..." : 
                  "Ask BERT a question about AI..."}
                className="flex-grow px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-gray-900 font-inter"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 text-white rounded-r-lg hover:bg-gray-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed font-pj"
                disabled={isTyping || !input.trim()}
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-2 w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">
                  {models[task].name} model ready
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {input.length} / 500 characters
              </div>
            </div>
          </form>
        </div>
        
        <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-gray-500">
          <p>This demo uses {models[task].name} model for {task === "completion" ? "text completion" : "question answering"}.</p>
          <p className="mt-1">Results may vary based on input complexity and model limitations.</p>
        </div>
      </div>
    </div>
  )
}