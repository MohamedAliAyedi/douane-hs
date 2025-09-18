"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, File, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export function FileUploader({ file, setFile }: FileUploaderProps) {
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    onError: (err) => {
      setError("Error uploading file");
      console.error(err);
    },
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File not accepted";
      setError(error);
    },
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors",
          isDragActive && "border-primary bg-muted/50",
          error && "border-destructive",
          file && "border-green-500"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {file ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <File className="h-8 w-8 text-blue-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">
                  Drop your file here or click to upload
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Maximum file size: 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {file && !error && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>File ready to upload</span>
        </div>
      )}
    </div>
  );
}
