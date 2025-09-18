"use client";

import { useState, useEffect, useRef } from "react";
import ChatArea from "./chat/ChatArea";
import { ChatInput } from "./chat/ChatInput";
import { sendMessage, Message } from "@/service/chat.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Sparkles,
  User,
  Bot,
  Clock,
  Zap,
  Brain,
  Settings,
  MoreVertical,
  Plus,
  History,
  Star,
  TrendingUp,
} from "lucide-react";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[] | any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    messagesCount: 0,
    startTime: new Date(),
  });

  // Reference to the chat area to control scrolling
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever a new message is added
  useEffect(() => {
    chatAreaRef.current?.scrollTo({
      top: chatAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Update session stats
  useEffect(() => {
    setSessionStats((prev) => ({
      ...prev,
      messagesCount: messages.length,
    }));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      type: "user",
      avatar: "/avatar1.jpg",
      name: "Mourad Chniti",
      message: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, userMessage]);
    setIsLoading(true);

    const aiMessage = await sendMessage(input);

    if (aiMessage) {
      setMessages((prevMessages: any) => [...prevMessages, aiMessage]);
    }

    setIsLoading(false);
    setInput("");
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setSessionStats({
      messagesCount: 0,
      startTime: new Date(),
    });
  };

  const getSessionDuration = () => {
    const duration = Math.floor(
      (Date.now() - sessionStats.startTime.getTime()) / 1000 / 60
    );
    return duration < 1 ? "< 1 min" : `${duration} min`;
  };

  const quickPrompts = [
    "Help me classify a product",
    "What's the HS code for electronics?",
    "Explain customs regulations",
    "How to fill declaration forms?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen mx-auto">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-lg">
          {/* Enhanced Header */}
          <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                      AI Assistant
                      <Badge className="ml-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Smart
                      </Badge>
                    </h1>
                    <p className="text-slate-600 flex items-center mt-1">
                      <span>Welcome back, Mourad</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        Active {getSessionDuration()}
                      </span>
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleNewChat}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div ref={chatAreaRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center space-y-6 max-w-2xl">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <MessageSquare className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      Welcome to AI Assistant
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                      I&apos;m here to help you with HS code classification,
                      customs regulations, and trade documentation. Ask me
                      anything about product classification or customs
                      procedures.
                    </p>
                  </div>

                  {/* Quick Prompts */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      Try asking:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left justify-start h-auto p-4 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                          onClick={() => setInput(prompt)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5">
                              <MessageSquare className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-sm text-slate-700">
                              {prompt}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    <div className="text-center">
                      <div className="bg-emerald-100 p-3 rounded-xl mx-auto w-fit mb-2">
                        <Star className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Expert Knowledge
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Trained on customs data
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-xl mx-auto w-fit mb-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Fast Responses
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Instant classifications
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-xl mx-auto w-fit mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Always Learning
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Updated regulations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ChatArea messages={messages} isLoading={isLoading} />
            )}
          </div>

          {/* Enhanced Chat Input */}
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-sm">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
