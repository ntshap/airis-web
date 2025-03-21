import { useState } from "react";
import axios from "axios";
import { MessageSquare, X, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

// Define the message type
interface Message {
  text: string;
  isUser: boolean;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm AIRIS Assistant. How can I help you with air quality today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages = messages.map(msg => ({
        content: msg.text,
        role: msg.isUser ? 'user' : 'assistant'
      }));
      apiMessages.push({ content: input, role: 'user' });

      // Make API call to Deepseek
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: "deepseek-chat",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract and add AI response
      const aiResponse: Message = { 
        text: response.data.choices[0].message.content.trim(), 
        isUser: false 
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: "Unable to get a response. Please try again."
      });

      // Add error message to chat
      const errorMessage: Message = { 
        text: "I'm having trouble responding right now. Please try again later.", 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className={`bg-dashboard-card rounded-lg shadow-lg mb-4 transition-all duration-300 ${
          isMinimized ? 'h-12' : 'h-[500px]'
        } w-[350px] flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">AIRIS Assistant</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white rounded-lg p-3 flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your question about air quality..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};