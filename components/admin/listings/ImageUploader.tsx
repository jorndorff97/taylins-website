"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  onRemove?: (index: number) => void;
  currentImages?: { url: string; sortOrder: number }[];
}

export function ImageUploader({ onUpload, onRemove, currentImages = [] }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onUpload(data.url);
      setPreview(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Create a synthetic event to reuse handleFileSelect logic
    const input = fileInputRef.current;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileSelect({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        
        {preview ? (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="mx-auto mb-2 h-32 w-32 rounded-lg object-cover" />
            <p className="text-xs text-slate-600">Uploading...</p>
          </div>
        ) : (
          <>
            <svg
              className="mb-3 h-10 w-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-1 text-sm font-medium text-slate-700">
              {uploading ? "Uploading..." : "Drop image or click to upload"}
            </p>
            <p className="text-xs text-slate-500">
              JPEG, PNG, WEBP, GIF (max 5MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {currentImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700">
            Uploaded Images ({currentImages.length})
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {currentImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/60 group-hover:opacity-100">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-white">
                      #{idx + 1}
                    </span>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(idx)}
                        className="rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
