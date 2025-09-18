/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Bot,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { sendFeedBack } from "@/service/chat.service";
import { toast } from "react-toastify";

const TYPING_SPEED = 30;

export default function AIMessage({
  name = "AI Assistant",
  message = "",
  time = "Now",
}: any) {
  const [displayedText, setDisplayedText] = useState("");
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const handleThumbsUp = async () => {
    if (thumbsUp || thumbsDown) {
      toast.info("You've already provided feedback for this message");
      return;
    }

    setThumbsUp(true);
    await handleFeedBack("Thanks for your answer is good!");
    toast.success("Thank you for your positive feedback!");
  };

  const handleThumbsDown = async () => {
    if (thumbsUp || thumbsDown) {
      toast.info("You've already provided feedback for this message");
      return;
    }

    setThumbsDown(true);
    await handleFeedBack("Your answer is not helpful!");
    toast.info("Thank you for your feedback. We'll work to improve!");
  };

  const handleFeedBack = async (feedback: string) => {
    try {
      const response = await sendFeedBack(feedback);
      if (!response) {
        toast.error("Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("An error occurred while sending feedback");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  useEffect(() => {
    if (!message) return;

    setDisplayedText("");
    setIsTypingComplete(false);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText((prev) => prev + message.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingInterval);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-start"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100 max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* AI Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{name}</span>
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{time}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-white/80 rounded-xl p-4 border border-slate-200/60 backdrop-blur-sm">
                <div className="prose prose-sm max-w-none">
                  <pre className="text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                    {displayedText}
                    {!isTypingComplete && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-4 bg-blue-600 ml-1"
                      />
                    )}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              {isTypingComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8 px-3"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-600" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center space-x-1 ml-2">
                      <span className="text-xs text-slate-500 mr-2">
                        Helpful?
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleThumbsUp}
                        className={`h-8 w-8 p-0 ${
                          thumbsUp
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        disabled={thumbsUp || thumbsDown}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleThumbsDown}
                        className={`h-8 w-8 p-0 ${
                          thumbsDown
                            ? "text-red-600 bg-red-50 hover:bg-red-100"
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        disabled={thumbsUp || thumbsDown}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{message.length} chars</span>
                    </div>
                    {(thumbsUp || thumbsDown) && (
                      <Badge variant="outline" className="text-xs">
                        {thumbsUp ? "👍 Helpful" : "👎 Needs improvement"}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
