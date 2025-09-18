/* eslint-disable @next/next/no-img-element */
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyIcon, User, Clock, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function UserMessage({ avatar, name, message, time }: any) {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex justify-end">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{name}</span>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    You
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-white/80">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{time}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-white/60">
                  {message.length} characters
                </div>
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
