import axios from 'axios';

const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export async function getChatbotResponse(messages: Array<{ content: string, role: 'user' | 'assistant' }>) {
  try {
    const response = await axios.post(
      DEEPSEEK_API_ENDPOINT,
      {
        model: "deepseek-chat", // Adjust based on Deepseek's model
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return "I'm having trouble responding right now. Please try again later.";
  }
}