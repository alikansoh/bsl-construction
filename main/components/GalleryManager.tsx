"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------------- */
/* Types                                                                    */
/* ----------------------------------------------------------------------- */

export interface UploadedImage {
  url: string;
  alt: string;
}

interface PendingUpload {
  id: string;
  fileName: string;
  previewUrl: string;
  progress: number;
  status: "uploading" | "error";
  errorMessage?: string;
}

interface GalleryManagerProps {
  photos: UploadedImage[];
  thumbnailUrl: string;
  heroImageUrl: string;
  onChange: (photos: UploadedImage[]) => void;
  onSelectThumbnail: (url: string) => void;
  onSelectHero: (url: string) => void;
  /** Endpoint that accepts a single-file multipart POST and returns { url }. */
  uploadEndpoint?: string;
  /** Max number of photos allowed in the pool. */
  maxPhotos?: number;
}

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

const deriveAltFromFileName = (fileName: string): string => {
  const withoutExtension = fileName.replace(/\.[a-z0-9]+$/i, "");
  const spaced = withoutExtension.replace(/[-_]+/g, " ").trim();

  if (!spaced) return "";

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12MB

/*
  Uploads one file with progress reporting via XHR (fetch doesn't expose
  upload progress). Resolves with the stored URL on success.
*/
function uploadFile(
  file: File,
  endpoint: string,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const url = data.url ?? data.data?.url;

          if (!url) {
            reject(new Error("Upload response did not include a URL."));
            return;
          }

          resolve(url);
        } catch {
          reject(new Error("Couldn't read the upload response."));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));

    xhr.send(formData);
  });
}

/* ----------------------------------------------------------------------- */
/* Small pieces                                                            */
/* ----------------------------------------------------------------------- */

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path
        d="M7 16a4 4 0 0 1-1.03-7.87 5.5 5.5 0 0 1 10.71-1.94A4.5 4.5 0 0 1 17 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v7m0-7 3 3m-3-3-3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.2"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Dropzone                                                                 */
/* ----------------------------------------------------------------------- */

function Dropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);

      if (disabled) return;

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [onFiles, disabled],
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-disabled={disabled}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50"
          : isDragActive
            ? "border-[#1F4B66] bg-[#1F4B66]/5"
            : "border-slate-300 bg-slate-50/60 hover:border-[#1F4B66]/60 hover:bg-[#1F4B66]/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onFiles(files);
          event.target.value = "";
        }}
        className="hidden"
      />

      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          isDragActive
            ? "bg-[#1F4B66] text-white"
            : "bg-[#1F4B66]/10 text-[#1F4B66] group-hover:bg-[#1F4B66]/15"
        }`}
      >
        <UploadIcon className="h-5 w-5" />
      </span>

      <div>
        <p className="text-sm font-semibold text-slate-700">
          {isDragActive ? "Drop to upload" : "Drag photos here, or click to browse"}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Select multiple at once · JPG, PNG, WebP or GIF · up to 12MB each
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Photo card                                                              */
/* ----------------------------------------------------------------------- */

function PhotoCard({
  photo,
  isThumbnail,
  isHero,
  onAltChange,
  onRemove,
  onSelectThumbnail,
  onSelectHero,
}: {
  photo: UploadedImage;
  isThumbnail: boolean;
  isHero: boolean;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
  onSelectThumbnail: () => void;
  onSelectHero: () => void;
}) {
  const hasRole = isThumbnail || isHero;
  const missingAlt = !photo.alt.trim();

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        hasRole ? "border-[#1F4B66]/40" : "border-slate-200"
      }`}
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt}
          className="h-full w-full object-cover"
        />

        {hasRole && (
          <div className="pointer-events-none absolute left-2 top-2 flex gap-1">
            {isThumbnail && (
              <span className="rounded-full bg-[#1F4B66] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                Thumbnail
              </span>
            )}
            {isHero && (
              <span className="rounded-full bg-[#D98E1F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                Hero
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow ring-1 ring-slate-200 transition-colors hover:text-[#C1401F]"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-2.5 p-3">
        <input
          value={photo.alt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Describe this photo (alt text)"
          className={`w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-[#1F4B66]/15 ${
            missingAlt
              ? "border-[#D98E1F]/50 bg-[#D98E1F]/5"
              : "border-slate-200 focus:border-[#1F4B66]"
          }`}
        />

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onSelectThumbnail}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              isThumbnail
                ? "bg-[#1F4B66] text-white"
                : "border border-slate-300 text-slate-600 hover:border-[#1F4B66] hover:text-[#1F4B66]"
            }`}
          >
            {isThumbnail ? "Thumbnail ✓" : "Set thumbnail"}
          </button>

          <button
            type="button"
            onClick={onSelectHero}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              isHero
                ? "bg-[#D98E1F] text-white"
                : "border border-slate-300 text-slate-600 hover:border-[#D98E1F] hover:text-[#D98E1F]"
            }`}
          >
            {isHero ? "Hero ✓" : "Set hero"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadingCard({ upload }: { upload: PendingUpload }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={upload.previewUrl}
          alt=""
          className={`h-full w-full object-cover ${
            upload.status === "error" ? "opacity-40 grayscale" : "opacity-70"
          }`}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/10">
          {upload.status === "uploading" ? (
            <>
              <Spinner className="h-6 w-6 animate-spin text-white" />
              <span className="rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
                {upload.progress}%
              </span>
            </>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C1401F] text-white">
              !
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-medium text-slate-600">
          {upload.fileName}
        </p>
        {upload.status === "error" && (
          <p className="mt-0.5 text-xs text-[#C1401F]">
            {upload.errorMessage ?? "Upload failed."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Main component                                                          */
/* ----------------------------------------------------------------------- */

export default function GalleryManager({
  photos,
  thumbnailUrl,
  heroImageUrl,
  onChange,
  onSelectThumbnail,
  onSelectHero,
  uploadEndpoint = "/api/upload",
  maxPhotos = 30,
}: GalleryManagerProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);

  /*
    Multiple uploads can finish in the same tick, each holding a `photos`
    closure from whenever the batch started. Appending straight off that
    closure means whichever upload resolves last "wins" and silently drops
    every other photo from the same batch. This ref always reflects the
    most recently known gallery — updated synchronously as each upload
    lands — so appends chain correctly no matter the finishing order.
  */
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const updatePending = (id: string, patch: Partial<PendingUpload>) => {
    setPending((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const dismissPending = (id: string) => {
    setPending((current) => current.filter((item) => item.id !== id));
  };

  const handleFiles = useCallback(
    (files: File[]) => {
      const roomLeft = Math.max(0, maxPhotos - photos.length - pending.length);
      const filesToUse = files.slice(0, roomLeft);

      filesToUse.forEach((file) => {
        const id = makeId();

        if (!ACCEPTED_TYPES.includes(file.type)) {
          setPending((current) => [
            ...current,
            {
              id,
              fileName: file.name,
              previewUrl: "",
              progress: 0,
              status: "error",
              errorMessage: "Unsupported file type.",
            },
          ]);
          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          setPending((current) => [
            ...current,
            {
              id,
              fileName: file.name,
              previewUrl: "",
              progress: 0,
              status: "error",
              errorMessage: "File is larger than 12MB.",
            },
          ]);
          return;
        }

        const previewUrl = URL.createObjectURL(file);

        setPending((current) => [
          ...current,
          { id, fileName: file.name, previewUrl, progress: 0, status: "uploading" },
        ]);

        uploadFile(file, uploadEndpoint, (progress) =>
          updatePending(id, { progress }),
        )
          .then((url: string) => {
            dismissPending(id);
            URL.revokeObjectURL(previewUrl);

            const next = [
              ...photosRef.current,
              { url, alt: deriveAltFromFileName(file.name) },
            ];

            photosRef.current = next;
            onChange(next);
          })
          .catch((error: Error) => {
            updatePending(id, { status: "error", errorMessage: error.message });
          });
      });
    },
    [photos, pending.length, maxPhotos, onChange, uploadEndpoint],
  );

  const updateAlt = (url: string, alt: string) => {
    onChange(
      photos.map((photo) => (photo.url === url ? { ...photo, alt } : photo)),
    );
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((photo) => photo.url !== url));
  };

  const atCapacity = photos.length + pending.length >= maxPhotos;

  return (
    <div className="space-y-4">
      <Dropzone onFiles={handleFiles} disabled={atCapacity} />

      {atCapacity && (
        <p className="text-xs text-slate-400">
          You&apos;ve reached the {maxPhotos}-photo limit for this project. Remove a
          photo to add more.
        </p>
      )}

      {(photos.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.url}
              photo={photo}
              isThumbnail={photo.url === thumbnailUrl}
              isHero={photo.url === heroImageUrl}
              onAltChange={(alt) => updateAlt(photo.url, alt)}
              onRemove={() => removePhoto(photo.url)}
              onSelectThumbnail={() =>
                onSelectThumbnail(photo.url === thumbnailUrl ? "" : photo.url)
              }
              onSelectHero={() =>
                onSelectHero(photo.url === heroImageUrl ? "" : photo.url)
              }
            />
          ))}

          {pending.map((upload) => (
            <div key={upload.id} className="relative">
              <UploadingCard upload={upload} />

              {upload.status === "error" && (
                <button
                  type="button"
                  onClick={() => dismissPending(upload.id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow ring-1 ring-slate-200 hover:text-[#C1401F]"
                  aria-label="Dismiss"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && pending.length === 0 && (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Upload your photos, then click &quot;Set thumbnail&quot; or &quot;Set hero&quot; on the
          ones you want to use.
        </p>
      )}
    </div>
  );
}