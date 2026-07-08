import { useEffect, useState, useRef, useCallback } from "react";
import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "@/routes/__root";
import { Skeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast-provider";
import { fetchMedia, uploadMedia, deleteMedia, getMediaUrl, type MediaMeta } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, UploadCloud } from "lucide-react";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/media",
  component: MediaLibrary,
});

function MediaLibrary() {
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMedia();
        if (cancelled) return;
        setMedia(data.data);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load media");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      let successCount = 0;
      let failCount = 0;
      const items: MediaMeta[] = [];
      for (const file of Array.from(files)) {
        try {
          const item = await uploadMedia(file);
          items.push(item);
          successCount++;
        } catch {
          failCount++;
        }
      }
      if (items.length > 0) {
        setMedia((prev) => [...items, ...prev]);
        setTotal((prev) => prev + items.length);
      }
      if (successCount > 0) {
        toast(`${successCount} file${successCount === 1 ? "" : "s"} uploaded`, "success");
      }
      if (failCount > 0) {
        toast(`${failCount} file${failCount === 1 ? "" : "s"} failed`, "error");
      }
      setUploading(false);
    },
    [toast],
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCountRef.current = 0;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
      toast("File deleted", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      setError(msg);
      toast(msg, "error");
    }
  };

  const isImage = (mime: string) => mime.startsWith("image/");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="mt-1 h-5 w-16" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-2 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative space-y-6"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            {total} file{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            id="media-upload"
            className="hidden"
            multiple
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary bg-background/95">
          <UploadCloud className="h-10 w-10 text-primary" />
          <p className="text-lg font-medium">Drop files to upload</p>
          <p className="text-sm text-muted-foreground">Release to start uploading</p>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Uploading files...</p>
        </div>
      )}

      {media.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-lg border p-12 text-center transition-colors"
          onDragEnter={handleDragEnter}
        >
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground">
            Drag and drop images or files to get started
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Choose Files
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
            >
              {isImage(item.mimeType) ? (
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={getMediaUrl(item.id)}
                    alt={item.alt || item.originalName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted p-4">
                  <p className=" truncate text-center text-xs text-muted-foreground">
                    {item.mimeType}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="p-2">
                <p className=" truncate text-xs font-medium">{item.originalName}</p>
                <p className="text-xs text-muted-foreground">{(item.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
