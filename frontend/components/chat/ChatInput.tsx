"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mic,
  RefreshCcw,
  Send,
  Upload,
  Loader2,
  MicOff,
  Sparkles,
  Zap,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface ISearchInput {
  input: string;
  setInput: any;
  handleSend: () => void;
  isLoading?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatInput = ({
  input,
  setInput,
  handleSend,
  isLoading,
}: ISearchInput) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [charCount, setCharCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const recognizedTranscript = event.results[0][0].transcript;

          setInput((prev: any) =>
            prev ? `${prev} ${recognizedTranscript}` : recognizedTranscript
          );
          setTranscript(recognizedTranscript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn("SpeechRecognition API is not supported in this browser.");
      }
    }
  }, [setInput]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      // Handle the file upload or process the file here
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSend();
      }
    }
  };

  const handleClear = () => {
    setInput("");
    setTranscript("");
    setCharCount(0);
  };

  const canSend = input.trim() && !isLoading;

  return (
    <div className="p-6 space-y-4">
      {/* Voice Recording Status */}
      {isListening && (
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl px-4 py-3 flex items-center space-x-3 shadow-sm">
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-red-700">
                Recording...
              </span>
              <Badge
                variant="outline"
                className="text-xs bg-red-100 text-red-700 border-red-200"
              >
                Listening
              </Badge>
            </div>
            <span className="text-xs text-red-600">
              Speak clearly into your microphone
            </span>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="relative">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg overflow-hidden transition-all duration-200 focus-within:shadow-xl focus-within:border-blue-300/60">
          {/* Input Area */}
          <div className="flex items-end p-4 space-x-3">
            {/* Text Input */}
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Input
                  className="min-h-[48px] max-h-32 resize-none border-0 bg-transparent text-base placeholder:text-slate-500 focus:ring-0 focus:outline-none px-4 py-3 leading-relaxed"
                  placeholder={
                    isLoading
                      ? "AI is thinking..."
                      : "Ask me anything about HS codes, customs, or trade..."
                  }
                  value={isLoading ? "" : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  style={{
                    minHeight: "48px",
                    maxHeight: "128px",
                    overflowY: "auto",
                  }}
                />

                {/* Character Counter */}
                {charCount > 0 && (
                  <div className="absolute bottom-2 right-3">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        charCount > 500
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {charCount}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* File Upload Button */}
              <Button
                onClick={handleFileUpload}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                disabled={isLoading}
                title="Upload file"
              >
                <Upload className="h-4 w-4" />
              </Button>

              {/* Clear Button */}
              {input && (
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
                  disabled={isLoading}
                  title="Clear input"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}

              {/* Voice Input Button */}
              <Button
                onClick={handleMicClick}
                variant="ghost"
                size="sm"
                className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                  isListening
                    ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                    : "text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
                disabled={isLoading}
                title={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!canSend}
                className={`h-10 px-4 rounded-xl font-medium transition-all duration-200 ${
                  canSend
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Sending</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span className="text-sm">Send</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Bottom Bar with Status and Tips */}
          <div className="px-4 pb-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>AI is processing your request...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    <span>AI-powered responses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-emerald-500" />
                    <span>Fast & accurate</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span>Press Enter to send</span>
              <div className="w-px h-3 bg-slate-300"></div>
              <span>Shift + Enter for new line</span>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      {/* Quick Suggestions (when input is empty) */}
      {!input && !isLoading && (
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "What's the HS code for electronics?",
            "Help with customs declaration",
            "Classify my product",
            "Explain trade regulations",
          ].map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => setInput(suggestion)}
              className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-full px-3 py-1.5 transition-all duration-200"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
