"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  processImage,
  sendFeedBack,
  sendMessage,
} from "@/service/chat.service";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/ui/FileUploader";
import {
  Loader2,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
  Info,
  HelpCircle,
  Camera,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hsCode, setHsCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
      setThumbsUp(false);
      setThumbsDown(false);
      setHsCode("");
    }
  }, [image]);

  const handleUpload = async () => {
    setHsCode("");
    if (image) {
      setLoading(true);
      try {
        const response = await processImage(image);
        if (response) {
          await handleSearch(response);
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("Please select an image first");
    }
  };

  const handleFeedBack = async (feedback: string) => {
    try {
      const message = await sendFeedBack(feedback);
      if (message) {
        toast.success("Feedback sent successfully!");
      } else {
        toast.error("Failed to send feedback!");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  const handleThumbsUp = () => {
    if (thumbsUp || thumbsDown) {
      toast.info("You've already provided feedback");
    } else {
      setThumbsUp(true);
      handleFeedBack("Thanks for your answer is good!");
      toast.success("Thank you for your positive feedback!");
    }
  };

  const handleThumbsDown = () => {
    if (thumbsUp || thumbsDown) {
      toast.info("You've already provided feedback");
    } else {
      setThumbsDown(true);
      handleFeedBack("Your answer is not helpful!");
      toast.info("We're sorry the result wasn't helpful. We'll improve!");
    }
  };

  const handleSearch = async (_caption: string) => {
    if (_caption) {
      const response = await sendMessage(
        "Hello can you help me with the HS code for this product or animal i have caption that i extract from image: " +
          _caption +
          " | please i want one hs code with on one short awnser and 2 or 3 lines of description" +
          " | it can be animal or product if animal please don't forget check chapter 1" +
          " | if there is more than one product or animal in the image please tell me the hs code for each one of them" +
          " | if you can't find the hs code please tell me that you can't find it"
      );
      if (response) {
        console.log(response);
        setHsCode(response.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <Camera className="h-8 w-8 mr-3 text-blue-600" />
              AI Image Classification
            </h1>
            <p className="text-slate-600 mt-2">
              Upload product images to automatically identify HS codes using
              advanced AI analysis
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setShowHelp(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            How it works
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Upload className="h-5 w-5 mr-3 text-blue-600" />
                Upload Product Image
              </CardTitle>
              <CardDescription>
                Select a clear image of your product for AI-powered HS code
                identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Uploader */}
              <div>
                <FileUploader file={image} setFile={setImage} />
              </div>

              {/* Image Preview */}
              {preview ? (
                <div className="relative group">
                  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-slate-50"
                    />
                  </div>
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <X className="h-4 w-4 text-slate-600" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 text-slate-700 border border-slate-200">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      Image ready
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 h-64 transition-colors hover:border-blue-300 hover:bg-blue-50/30">
                  <div className="text-center space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit">
                      <ImageIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">
                        Upload an image to get started
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Supported formats: JPG, PNG, GIF (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-12"
                disabled={loading || !image}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Pro tip:</span> For best
                      results, use clear images with good lighting, single
                      products against plain backgrounds, and avoid images with
                      multiple items or text overlays.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Results */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <AlertCircle className="h-5 w-5 mr-3 text-blue-600" />
                    Classification Results
                  </CardTitle>
                  <CardDescription>
                    AI-generated HS code analysis and classification details
                  </CardDescription>
                </div>
                {hsCode && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Helpful?</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleThumbsUp}
                        className={`p-2 h-8 w-8 ${
                          thumbsUp
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        disabled={thumbsDown}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleThumbsDown}
                        className={`p-2 h-8 w-8 ${
                          thumbsDown
                            ? "text-red-600 bg-red-50 hover:bg-red-100"
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        disabled={thumbsUp}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-80 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                      </div>
                      <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-blue-600/30" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-semibold text-lg">
                        Processing your image
                      </p>
                      <p className="text-slate-600 text-sm mt-1">
                        Our AI is analyzing the image to identify the HS code...
                      </p>
                    </div>
                  </div>
                </div>
              ) : hsCode ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-100 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                          HS Code Classification
                          <Badge className="ml-3 bg-emerald-100 text-emerald-700 border-emerald-200">
                            AI Generated
                          </Badge>
                        </h4>
                        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                          <div className="bg-white/60 p-4 rounded-lg border border-emerald-100">
                            {hsCode.split("\n").map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback confirmation */}
                  {(thumbsUp || thumbsDown) && (
                    <div
                      className={`rounded-xl p-4 border ${
                        thumbsUp
                          ? "bg-green-50 border-green-200"
                          : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {thumbsUp ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <p className="text-sm font-medium text-slate-700">
                          {thumbsUp
                            ? "Thank you for your positive feedback!"
                            : "Thank you for your feedback. We'll work to improve our results."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-center space-y-4">
                    <div className="bg-slate-200 p-4 rounded-full mx-auto w-fit">
                      <AlertCircle className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">
                        Results will appear here
                      </p>
                      <p className="text-slate-500 text-sm mt-1 max-w-sm">
                        Upload an image and click &quot;Analyze with AI&quot; to
                        get HS code classification
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="max-w-lg w-full shadow-2xl border-0">
              <CardHeader className="border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-3 text-blue-600" />
                    How AI Classification Works
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelp(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <span className="font-bold text-blue-600 text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        Upload Image
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Select a clear, high-quality image of the product or
                        animal you want to classify. Ensure good lighting and
                        minimal background distractions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <span className="font-bold text-blue-600 text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        AI Analysis
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Our advanced AI processes the image, identifies key
                        features, and generates a detailed description to
                        determine the appropriate HS classification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <span className="font-bold text-blue-600 text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        Get Results
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Receive the HS code along with a comprehensive
                        description and classification rationale. Multiple
                        products in one image will be identified separately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        Best Practices
                      </p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Use images with single products when possible</li>
                        <li>• Ensure clear focus and good lighting</li>
                        <li>• Avoid heavy text overlays or watermarks</li>
                        <li>
                          • For animals, include clear view of distinguishing
                          features
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowHelp(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-6"
                >
                  Got it, thanks!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
