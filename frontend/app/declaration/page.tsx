"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  Camera,
  Scan,
  Info,
} from "lucide-react";
import { uploadImage } from "@/service/ocr.service";
import { FileUploader } from "@/components/ui/FileUploader";
import InvoiceForm from "@/components/deckaration/InvoiceForm";

export default function DeclarationPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  const handleImageClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom / 1.2, 0.5));
  };

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(image);
    } else {
      setImageUrl("");
    }
  }, [image]);

  const handleCheck = async () => {
    if (!image) {
      return;
    }

    try {
      setLoading(true);
      setTaskStatus("processing");

      const data = await uploadImage(image);
      console.log("Task data:", data);
      setTaskResult(data);

      setTaskStatus("completed");
    } catch (error) {
      console.error("Error during upload:", error);
      setTaskStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImageUrl("");
    setTaskStatus(null);
    setTaskResult(null);
    setZoom(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center">
            <Scan className="h-8 w-8 mr-3 text-blue-600" />
            Invoice Analysis & Declaration
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Upload invoice images for automated OCR processing and intelligent
            data extraction. Our AI will analyze and structure your invoice data
            for easy declaration processing.
          </p>
        </div>

        {!taskResult ? (
          /* Upload and Processing Section */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Upload className="h-5 w-5 mr-3 text-blue-600" />
                  Upload Invoice Document
                </CardTitle>
                <CardDescription>
                  Select a clear image of your invoice for automated data
                  extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Uploader */}
                <div>
                  <FileUploader file={image} setFile={setImage} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleCheck}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-12"
                    disabled={loading || !image}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Invoice
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-6 h-12 border-slate-300 hover:bg-slate-50"
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Best practices:</span> Use
                        high-resolution images with clear text, ensure good
                        lighting, and avoid shadows or glare for optimal OCR
                        accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Preview and Status */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Eye className="h-5 w-5 mr-3 text-blue-600" />
                  Document Preview
                </CardTitle>
                <CardDescription>
                  Preview your uploaded document and processing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative group">
                      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                        <img
                          src={imageUrl}
                          alt="Invoice Preview"
                          className="w-full h-80 object-contain bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={handleImageClick}
                        />
                      </div>
                      <button
                        onClick={handleImageClick}
                        className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <div className="bg-white/90 rounded-full p-3 shadow-lg">
                          <Eye className="h-5 w-5 text-slate-700" />
                        </div>
                      </button>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-slate-700 border border-slate-200">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Ready to process
                        </Badge>
                      </div>
                    </div>

                    {/* Processing Status */}
                    {taskStatus === "processing" && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Scan className="h-6 w-6 text-blue-600" />
                            </div>
                            <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600/30" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Processing Invoice
                            </p>
                            <p className="text-slate-600 text-sm">
                              Extracting text and analyzing document
                              structure...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {taskStatus === "failed" && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                        <div className="flex items-center gap-4">
                          <div className="bg-red-100 p-3 rounded-full">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Processing Failed
                            </p>
                            <p className="text-slate-600 text-sm">
                              Unable to process the invoice. Please try again
                              with a clearer image.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-80 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-center space-y-4">
                      <div className="bg-slate-200 p-4 rounded-full mx-auto w-fit">
                        <Camera className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium">
                          No document uploaded
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                          Upload an invoice image to see the preview here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Success Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Invoice Processing Complete
                      </h2>
                      <p className="text-slate-600">
                        Data extracted successfully. Review and edit the
                        information below.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Process New Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Form */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 mr-3 text-blue-600" />
                  Extracted Invoice Data
                </CardTitle>
                <CardDescription>
                  Review and modify the extracted information before proceeding
                  with declaration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceForm initialData={taskResult} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image Zoom Modal */}
        {modalOpen && imageUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="relative max-w-full max-h-full">
              {/* Image Container */}
              <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="max-h-[80vh] overflow-auto">
                  <img
                    src={imageUrl}
                    alt="Invoice Full View"
                    className="max-w-full h-auto transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={handleCloseModal}
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white shadow-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button
                  onClick={handleZoomOut}
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white shadow-lg"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4 mr-1" />
                  Zoom Out
                </Button>
                <div className="bg-white/90 px-3 py-2 rounded-md shadow-lg text-sm font-medium">
                  {Math.round(zoom * 100)}%
                </div>
                <Button
                  onClick={handleZoomIn}
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white shadow-lg"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom In
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
