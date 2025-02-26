'use server'

export async function generateAIResponse(task: string, input: string) {
  try {
    
    const apiUrl = process.env.AI_API_URL || 'http://localhost:5000/predict'
    
    let requestBody = {}
    
    if (task === "completion") {
      requestBody = {
        task_type: "completion",
        text: input
      }
    } else if (task === "qa") {
      
      requestBody = {
        task_type: "qa",
        question: input,
        context: "AI stands for Artificial Intelligence. It involves machines that can perform tasks that typically require human intelligence. These tasks include learning from examples and experience, recognizing objects, understanding and responding to language, making decisions, and solving problems. GPT-2 is a language model that can generate text. BERT is a model that can understand the context of words in text."
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to get AI response')
    }
    
    const data = await response.json()
    return data.response
  } catch (error) {
    console.error('AI generation error:', error)
    return `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI service'}`
  }
}