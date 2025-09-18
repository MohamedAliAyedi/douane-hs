import React from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import { Skeleton } from "../shared/Skeleton";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Bot,
  Loader2,
  Sparkles,
  MessageSquare,
  Clock,
  Brain,
} from "lucide-react";

interface IChatAreaProps {
  isLoading: boolean;
  messages: Array<{
    type: "user" | "ai";
    avatar?: string;
    name: string;
    message: string;
    time: string;
  }>;
}

export default function ChatArea({ isLoading, messages }: IChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto p-6 space-y-6">
        {messages.map((msg, index) =>
          msg.type === "user" ? (
            <UserMessage
              key={index}
              avatar={msg.avatar}
              name={msg.name}
              message={msg.message}
              time={msg.time}
            />
          ) : (
            <AIMessage
              key={index}
              name={msg.name}
              message={msg.message}
              time={msg.time}
            />
          )
        )}

        {/* Enhanced Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* AI Avatar with Animation */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">
                          AI Assistant
                        </span>
                        <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Thinking
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>now</span>
                      </div>
                    </div>

                    {/* Animated Thinking Indicator */}
                    <div className="bg-white/60 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-700">
                              Processing your request...
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-full bg-blue-100" />
                            <Skeleton className="h-3 w-3/4 bg-blue-100" />
                            <Skeleton className="h-3 w-1/2 bg-blue-100" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>Analyzing query</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Generating response</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
