"use client";

import { useCallback, useRef, useState } from "react";

export interface UploadedImage {
  url: string;
  publicId?: string;
  alt: string;
}

interface ImageUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  message?: string;
}

interface ImageUploaderProps {
  value: UploadedImage;
  onChange: (img: UploadedImage) => void;
  label?: string;
  required?: boolean;
  aspect?: "square" | "video" | "portrait";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Couldn't upload image.";
}

function deleteCloudinaryAsset(publicId: string) {
  // Best-effort cleanup of a replaced image. Deliberately fire-and-forget:
  // don't block the UI or surface an error to the user for this — if it
  // fails, the scheduled reconciliation job will catch it later.
  fetch("/api/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  }).catch(() => {});
}

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
  required = false,
  aspect = "square",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  const aspectClass =
    aspect === "video"
      ? "aspect-video"
      : aspect === "portrait"
        ? "aspect-[3/4]"
        : "aspect-square";

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setError("Image must be smaller than 8MB.");
        return;
      }

      setError(null);
      setUploading(true);

      const localPreview = URL.createObjectURL(file);
      const previousPublicId = value.publicId;

      // Show local preview immediately
      onChange({
        ...value,
        url: localPreview,
      });

      try {
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body,
        });

        const data = (await res.json()) as ImageUploadResponse;

        if (!res.ok || !data.success || !data.url) {
          throw new Error(data.message || "Upload failed");
        }

        onChange({
          url: data.url,
          publicId: data.publicId,
          alt: value.alt,
        });

        // Clean up the image we just replaced, if there was one.
        if (previousPublicId) {
          deleteCloudinaryAsset(previousPublicId);
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error));

        // Restore previous image if upload fails
        onChange(value);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(localPreview);
      }
    },
    [onChange, value]
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];

    if (file) {
      void upload(file);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-[#C1401F]">*</span>
          )}
        </span>

        <button
          type="button"
          onClick={() => setShowUrlField((value) => !value)}
          className="text-xs font-medium text-slate-400 underline decoration-dotted underline-offset-2 hover:text-slate-600"
        >
          {showUrlField
            ? "Hide URL field"
            : "Paste URL instead"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
        {/* Dropzone / Preview */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          onClick={() => {
            inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`group relative flex ${aspectClass} w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors sm:w-[140px] ${
            dragging
              ? "border-[#1F4B66] bg-[#1F4B66]/5"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
            }}
          />

          {value.url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.url}
                alt={value.alt || ""}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.opacity = "0.15";
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                Replace
              </div>
            </>
          ) : (
            <div className="px-3 text-center">
              <span className="mx-auto mb-1.5 block text-lg">
                📷
              </span>

              <span className="text-[11px] font-medium text-slate-500">
                Drop image or click
              </span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#1F4B66]" />
            </div>
          )}
        </div>

        {/* Alt Text + URL */}
        <div className="space-y-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Alt text{" "}
              {required && (
                <span className="text-[#C1401F]">*</span>
              )}
            </span>

            <input
              value={value.alt}
              onChange={(event) => {
                onChange({
                  ...value,
                  alt: event.target.value,
                });
              }}
              placeholder="Describe the image for accessibility & SEO"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1F4B66] focus:ring-2 focus:ring-[#1F4B66]/15"
            />
          </label>

          {showUrlField && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">
                Image URL
              </span>

              <input
                value={value.url}
                onChange={(event) => {
                  onChange({
                    ...value,
                    url: event.target.value,
                  });
                }}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1F4B66] focus:ring-2 focus:ring-[#1F4B66]/15"
              />
            </label>
          )}

          {error && (
            <p className="text-xs font-medium text-[#C1401F]">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}