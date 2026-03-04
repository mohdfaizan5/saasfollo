"use client";

import { useMemo } from "react";
import { CircleUserRoundIcon, XIcon } from "lucide-react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

interface ProfilePicUploaderProps {
  initialImageUrl?: string | null;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  onFileChange?: (file: File | null) => void;
}

export default function ProfilePicUploader({
  initialImageUrl = null,
  disabled = false,
  label = "Upload image file",
  helperText = "Upload, drag-and-drop, or remove image",
  onFileChange,
}: ProfilePicUploaderProps) {
  const initialFiles = useMemo(
    () =>
      initialImageUrl
        ? [
            {
              id: "initial-project-image",
              name: "current-image",
              size: 0,
              type: "image/*",
              url: initialImageUrl,
            },
          ]
        : [],
    [initialImageUrl],
  );

  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize: 2 * 1024 * 1024,
    initialFiles,
    onFilesAdded: (addedFiles) => {
      const firstAdded = addedFiles[0]?.file;
      onFileChange?.(firstAdded instanceof File ? firstAdded : null);
    },
  });

  const previewUrl = files[0]?.preview || null;

  const handleRemove = () => {
    removeFile(files[0]?.id);
    onFileChange?.(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        {/* Drop area */}
        <button
          aria-label={previewUrl ? "Change image" : "Upload image"}
          className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          disabled={disabled}
          type="button"
        >
          {previewUrl ? (
            <img
              alt={files[0]?.file?.name || "Uploaded image"}
              className="size-full object-cover"
              height={64}
              src={previewUrl}
              style={{ objectFit: "cover" }}
              width={64}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className="size-4 opacity-60" />
            </div>
          )}
        </button>
        {previewUrl && (
          <Button
            aria-label="Remove image"
            className="-top-1 -right-1 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background"
            onClick={handleRemove}
            disabled={disabled}
            size="icon"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
        <input
          {...getInputProps()}
          aria-label={label}
          className="sr-only"
          disabled={disabled}
          tabIndex={-1}
        />
      </div>
      <p
        aria-live="polite"
        className="mt-2 text-muted-foreground text-xs"
        role="region"
      >
        {helperText}
      </p>
    </div>
  );
}
