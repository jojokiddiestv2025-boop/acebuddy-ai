
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { ChatMessage } from '../types';
import { generateText, blobToBase64 } from '../services/geminiService';
import { AI_COMPANION_NAME, HOMEWORK_TOPICS } from '../constants';

interface ChatInterfaceProps {
  onBack: () => void;
}

// Define the SpeechRecognition interface for better TypeScript support
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  interpretation: any;
  emma: any;
}

interface CustomSpeechRecognition extends EventTarget {
  new (): CustomSpeechRecognition;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: CustomSpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onend: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: CustomSpeechRecognition;
    SpeechRecognition: CustomSpeechRecognition;
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      alert(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
    };

    // Cleanup recognition on component unmount
    return () => {
      recognition.stop();
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, []);


  const handleVoiceInputToggle = useCallback(() => {
    if (!recognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (e.g., JPEG, PNG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size exceeds 5MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to base64 for API
      try {
        const base64 = await blobToBase64(file);
        setImageData(base64);
        setImageMimeType(file.type);
      } catch (e) {
        console.error("Error converting image to base64:", e);
        alert("Could not process image.");
        setImagePreview(null);
        setImageData(null);
        setImageMimeType(null);
      }
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImageData(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  }, []);


  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === '' && !imageData) return; // Must have text or image

    const userMessageContent: ChatMessage = { sender: 'user', text: inputMessage };
    if (imagePreview) {
      userMessageContent.imageUrl = imagePreview; // Store preview for display
    }

    setMessages((prevMessages) => [...prevMessages, userMessageContent]);
    setInputMessage('');
    setImagePreview(null);
    setIsLoading(true);

    try {
      // Use gemini-3-pro-preview if image data is present, otherwise gemini-3-flash-preview
      const modelToUse = imageData ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const aiResponse = await generateText({
        prompt: inputMessage,
        model: modelToUse,
        imageData: imageData || undefined,
        imageMimeType: imageMimeType || undefined,
      });
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: aiResponse }]);
    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: `Oops! Something went wrong: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
      setImageData(null); // Clear image data after sending
      setImageMimeType(null);
    }
  }, [inputMessage, imageData, imageMimeType, imagePreview]);

  const handleQuickQuestion = useCallback(async (question: string) => {
    const newUserMessage: ChatMessage = { sender: 'user', text: question };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      // Using gemini-3-flash-preview for quick answers, as per coding guidelines for basic text tasks.
      const aiResponse = await generateText({ prompt: question, model: 'gemini-3-flash-preview' });
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: aiResponse }]);
    } catch (error: any) {
      console.error('Error sending quick question to AI:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: `Oops! Something went wrong: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl relative">
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between rounded-t-lg shadow-md sticky top-0 z-10">
        <Button variant="ghost" className="text-white hover:bg-indigo-700 p-2 -ml-2" onClick={onBack} aria-label="Back to main menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <h2 className="text-xl font-bold flex-grow text-center mr-8">📚 Homework Help with {AI_COMPANION_NAME}</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 animate-fade-in">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccLZlAAAACXBIWXMAAsTAAALEwEAmpwYAAAFNUlEQVR4AteQPYxUUQCG/y1d0w3CiooIKrYQE9l8wMImJgiCRmJiwgIhoKgoLgwP2A+g/mB1tB2tLEICwMDiJ/EwtLwBBMb2Cq3+X+37e6d7pvV3e38PZk753dmdnbvC+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj" alt="Ace Buddy AI mascot thinking" className="rounded-full mb-4 opacity-80 w-36 h-36" />
            <p className="text-lg">Ask me anything about your homework!</p>
            <p className="text-sm">Here are some ideas:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {HOMEWORK_TOPICS.map((topic, index) => (
                <Button key={index} variant="outline" size="sm" onClick={() => handleQuickQuestion(topic)}>
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
            >
              <div
                className={`max-w-[70%] md:max-w-[60%] lg:max-w-[50%] p-3 rounded-xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="User upload" className="max-w-full h-auto rounded-md mb-2" />
                )}
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 p-3 rounded-xl rounded-bl-none shadow-md">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex flex-col shadow-lg">
        {imagePreview && (
          <div className="relative mb-2 self-start p-2 border border-gray-200 rounded-lg">
            <img src={imagePreview} alt="Image preview" className="h-24 w-auto object-cover rounded-md" />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center">
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
            disabled={isLoading}
            aria-label="Upload image"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="md"
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isListening}
            title="Upload an image for analysis"
            aria-label="Upload image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2-6a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </Button>
          <Button
            onClick={handleVoiceInputToggle}
            variant="ghost"
            size="md"
            className={`p-2 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || !SpeechRecognition}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            aria-live="polite"
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a4 4 0 01-4-4V5a4 4 0 118 0v2a4 4 0 01-4 4z" />
            </svg>
          </Button>
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isListening ? 'Listening...' : 'Type your question here...'}
            className="flex-grow mx-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading || isListening}
            aria-label="Your homework question"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || (inputMessage.trim() === '' && !imageData)} variant="primary" size="md">
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ChatInterface;