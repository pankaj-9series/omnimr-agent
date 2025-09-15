import React, { useState } from 'react';
import { Project, Slide, ParsedCSVData, Suggestion } from '@/lib/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAppContext } from '../../lib/context/AppContext';

// Removed ConversationScreenProps interface

const ConversationScreen: React.FC = () => {
  const {
    project,
    addSlide,
    removeSlide,
    slides,
    csvData,
    requestId,
    suggestions,
    setSuggestions,
    isSuggestionsLoading,
    setIsSuggestionsLoading,
  } = useAppContext();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          filePath: requestId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const result = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlide = (slideData: Omit<Slide, 'slideNumber'>) => {
    const newSlide: Slide = {
      ...slideData,
      slideNumber: slides.length + 1
    };
    addSlide(newSlide);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">AI Analysis & Conversation</h2>
        <p className="text-lg text-slate-600">Chat with AI to analyze your data and create insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Chat with AI</h3>
          
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <Spinner />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your data..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()}>
              Send
            </Button>
          </div>
        </Card>

        {/* Slides Panel */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Generated Slides</h3>
          
          {slides.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No slides created yet.</p>
              <p className="text-sm mt-2">Chat with AI to generate insights and slides.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slides.map((slide) => (
                <div key={slide.slideNumber} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">{slide.title}</h4>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => removeSlide(slide.slideNumber)}
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Type: {slide.chartType}</p>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Insights:</p>
                    <ul className="list-disc list-inside mt-1">
                      {slide.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConversationScreen;
