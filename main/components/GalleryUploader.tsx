"use client";

import { useCallback, useRef, useState } from "react";
import type { UploadedImage } from "./ImageUploader";

interface GalleryUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

function deleteCloudinaryAsset(publicId: string) {
  // Best-effort cleanup. Fire-and-forget: don't block the UI or
  // surface an error to the user — if it fails, the scheduled
  // reconciliation job will catch it later.
  fetch("/api/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  }).catch(() => {});
}

/**
 * Multi-image uploader for the gallery. Accepts many files at once
 * (drag & drop or multi-select), uploads them in parallel, and lets
 * the user edit alt text / reorder / remove afterwards.
 */
export default function GalleryUploader({ images, onChange }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;

      setError(null);
      setPending((p) => p + list.length);

      const results = await Promise.allSettled(
        list.map(async (file) => {
          const body = new FormData();
          body.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");
          return { url: data.url, publicId: data.publicId, alt: "" } as UploadedImage;
        })
      );

      const succeeded: UploadedImage[] = [];
      let failCount = 0;
      results.forEach((r) => {
        if (r.status === "fulfilled") succeeded.push(r.value);
        else failCount++;
      });

      if (failCount > 0) {
        setError(`${failCount} image${failCount > 1 ? "s" : ""} failed to upload.`);
      }

      onChange([...images, ...succeeded]);
      setPending((p) => Math.max(0, p - list.length));
    },
    [images, onChange]
  );

  const updateAt = (i: number, patch: Partial<UploadedImage>) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));

  const removeAt = (i: number) => {
    const removed = images[i];

    onChange(images.filter((_, idx) => idx !== i));

    if (removed?.publicId) {
      deleteCloudinaryAsset(removed.publicId);
    }
  };

  const moveAt = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging
            ? "border-[#1F4B66] bg-[#1F4B66]/5"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <span className="text-xl">🖼️</span>
        <p className="text-sm font-medium text-slate-600">
          Drop multiple photos here, or click to browse
        </p>
        <p className="text-xs text-slate-400">You can select several files at once</p>
        {pending > 0 && (
          <p className="mt-1 text-xs font-medium text-[#1F4B66]">Uploading {pending}…</p>
        )}
        {error && <p className="mt-1 text-xs font-medium text-[#C1401F]">{error}</p>}
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <div key={img.url + i} className="rounded-lg border border-slate-200 p-3">
              <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </div>
              <input
                value={img.alt}
                onChange={(e) => updateAt(i, { alt: e.target.value })}
                placeholder="Alt text"
                className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-[#1F4B66] focus:ring-2 focus:ring-[#1F4B66]/15"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveAt(i, -1)}
                    disabled={i === 0}
                    className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    title="Move earlier"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAt(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    title="Move later"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="font-medium text-[#C1401F] hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}