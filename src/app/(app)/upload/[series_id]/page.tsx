"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Upload, File, X, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

interface FileEntry {
  file: File;
  bookTitle: string;
  bookNumber: number;
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  errorMsg?: string;
  bookId?: string;
  progress?: string;
}

const PROCESSING_STAGES = [
  "Reading manuscript...",
  "Detecting chapters...",
  "Extracting characters...",
  "Mapping locations...",
  "Building timeline...",
  "Identifying world rules...",
  "Finalizing bible...",
];

export default function UploadPage() {
  const params = useParams();
  const seriesId = params.series_id as string;

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newEntries: FileEntry[] = accepted.map((f, i) => ({
      file: f,
      bookTitle: f.name.replace(/\.[^.]+$/, ""),
      bookNumber: files.length + i + 1,
      status: "idle",
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const updateFile = (index: number, updates: Partial<FileEntry>) => {
    setFiles((prev) => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const pollStatus = async (bookId: string, index: number) => {
    let stageIndex = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/books/${bookId}/status`);
        const data = await res.json();

        if (data.status === "complete") {
          updateFile(index, { status: "complete", progress: "Complete!" });
          return;
        } else if (data.status === "error") {
          updateFile(index, { status: "error", errorMsg: "Processing failed. Please try again." });
          return;
        }

        // Show cycling progress messages
        updateFile(index, {
          status: "processing",
          progress: PROCESSING_STAGES[stageIndex % PROCESSING_STAGES.length],
        });
        stageIndex++;

        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 3000);
      }
    };

    await poll();
  };

  const handleUpload = async () => {
    if (files.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      if (entry.status !== "idle") continue;

      updateFile(i, { status: "uploading", progress: "Uploading file..." });

      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("book_title", entry.bookTitle);
        formData.append("book_number", String(entry.bookNumber));
        formData.append("series_id", seriesId);

        const res = await fetch("/api/upload-manuscript", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        updateFile(i, { status: "processing", bookId: data.bookId, progress: "Processing..." });
        pollStatus(data.bookId, i);
      } catch (err: unknown) {
        updateFile(i, {
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setIsSubmitting(false);
  };

  const allComplete = files.length > 0 && files.every((f) => f.status === "complete");
  const hasIdle = files.some((f) => f.status === "idle");

  return (
    <div className="max-w-reading mx-auto px-6 py-10">
      <Link
        href={`/series/${seriesId}`}
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Series
      </Link>

      <h1 className="font-serif text-3xl font-bold text-ink-blue mb-2">Upload Manuscripts</h1>
      <p className="text-ink-muted mb-8">
        Drop in your book files. ThreadKey will read every chapter and build your series bible automatically.
      </p>

      {/* Dropzone */}
      {hasIdle || files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6 ${
            isDragActive
              ? "border-amber bg-amber-pale"
              : "border-[#C4B9A8] bg-white hover:border-ink-blue/40 hover:bg-parchment"
          }`}
        >
          <input {...getInputProps()} />
          <Upload
            size={40}
            className={`mx-auto mb-4 ${isDragActive ? "text-amber" : "text-ink-muted/50"}`}
          />
          <p className="text-ink-blue font-medium mb-1">
            {isDragActive ? "Drop your files here" : "Drag & drop manuscript files"}
          </p>
          <p className="text-sm text-ink-muted">or click to browse — PDF, DOCX, TXT accepted</p>
        </div>
      ) : null}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3 mb-6">
          {files.map((entry, i) => (
            <div key={i} className="bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <File size={20} className="text-ink-blue/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm text-ink-muted truncate">{entry.file.name}</p>
                    {entry.status === "idle" && (
                      <button
                        onClick={() => removeFile(i)}
                        className="text-ink-muted/50 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {entry.status === "idle" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-ink-blue mb-1">Book Title</label>
                        <input
                          type="text"
                          value={entry.bookTitle}
                          onChange={(e) => updateFile(i, { bookTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue text-sm focus:outline-none focus:border-ink-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-blue mb-1">Book Number</label>
                        <input
                          type="number"
                          value={entry.bookNumber}
                          min={1}
                          onChange={(e) => updateFile(i, { bookNumber: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 rounded-lg border border-[#E2D9CC] bg-parchment text-ink-blue text-sm focus:outline-none focus:border-ink-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {entry.status === "uploading" && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 size={14} className="animate-spin" />
                      {entry.progress || "Uploading..."}
                    </div>
                  )}
                  {entry.status === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-ink-blue">
                      <Loader2 size={14} className="animate-spin" />
                      {entry.progress || "Processing..."}
                    </div>
                  )}
                  {entry.status === "complete" && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle size={14} />
                      Bible built successfully — series bible updated
                    </div>
                  )}
                  {entry.status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle size={14} />
                      {entry.errorMsg || "Upload failed"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {hasIdle && (
          <button
            onClick={handleUpload}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-amber text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-light transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload & Process
          </button>
        )}

        {allComplete && (
          <Link
            href={`/bible/${seriesId}`}
            className="flex items-center gap-2 bg-ink-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-ink-blue-light transition-colors"
          >
            View Series Bible →
          </Link>
        )}

        {files.length > 0 && !allComplete && !isSubmitting && (
          <button
            onClick={() => setFiles([])}
            className="text-sm text-ink-muted hover:text-ink-blue transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
