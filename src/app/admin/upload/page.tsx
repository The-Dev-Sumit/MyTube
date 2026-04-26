"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, X, Eye, EyeOff, Upload, Link } from "lucide-react";
import { CATEGORIES } from "@/types";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import YouTube from "react-youtube";
import type { YouTubeProps, YouTubePlayer } from "react-youtube";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "tech",
    tags: "",
    published: true,
  });

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");

  const [thumbnailMode, setThumbnailMode] = useState<
    "upload" | "url" | "youtube"
  >("youtube");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailKey, setThumbnailKey] = useState(0);

  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    [],
  );

  const extractYoutubeId = useCallback((url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return "";
  }, []);

  const handleYoutubeUrlChange = useCallback(
    (url: string) => {
      setYoutubeUrl(url);
      const id = extractYoutubeId(url);
      setYoutubeVideoId(id);
      setDuration("");

      if (id) {
        if (thumbnailMode === "youtube") {
          setThumbnailUrl(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
        }
        toast.success("YouTube Video ID detected!");
      }
    },
    [extractYoutubeId, thumbnailMode],
  );

  const handleThumbnailFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        toast.error("Please select an image");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  const removeThumbnail = useCallback(() => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setThumbnailUrl("");
    setThumbnailKey((prev) => prev + 1);
  }, []);

  function detectYoutubeDuration(player: YouTubePlayer, retries = 10) {
    const seconds = Math.round(player.getDuration());

    if (seconds > 0) {
      setDuration(String(seconds));
      toast.success("Duration auto detected!");
      return;
    }

    if (retries > 0) {
      setTimeout(() => detectYoutubeDuration(player, retries - 1), 1000);
    }
  }

  const handleYoutubeReady: YouTubeProps["onReady"] = (event) => {
    detectYoutubeDuration(event.target);
  };

  const handleYoutubeError: YouTubeProps["onError"] = () => {
    toast.error("YouTube video load nahi hui. Check URL / embeddable setting.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!youtubeVideoId) {
      toast.error("Valid YouTube URL or Video ID required");
      return;
    }

    if (!duration) {
      toast.error("Duration is required");
      return;
    }

    if (thumbnailMode === "upload" && !thumbnailFile) {
      toast.error("Thumbnail file is required");
      return;
    }

    if (thumbnailMode === "url" && !thumbnailUrl.trim()) {
      toast.error("Thumbnail URL is required");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalThumbnailUrl = thumbnailUrl;

      if (thumbnailMode === "youtube" && youtubeVideoId) {
        finalThumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
      }

      if (thumbnailMode === "upload" && thumbnailFile) {
        toast.loading("Uploading thumbnail...", { id: "thumb" });
        const result = await uploadToCloudinary(
          thumbnailFile,
          "image",
          "mytube/thumbnails",
        );
        finalThumbnailUrl = result.secure_url;
        toast.success("Thumbnail uploaded!", { id: "thumb" });
      }

      if (!finalThumbnailUrl) {
        toast.error("Thumbnail required");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post("/api/admin/videos", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        thumbnail: finalThumbnailUrl,
        youtubeVideoId,
        duration: parseInt(duration),
        published: formData.published,
      });

      if (response.status === 201) {
        toast.success("Video added successfully!");

        setFormData({
          title: "",
          description: "",
          category: "tech",
          tags: "",
          published: false,
        });
        setYoutubeUrl("");
        setYoutubeVideoId("");
        setThumbnailUrl("");
        setThumbnailFile(null);
        setThumbnailPreview("");
        setDuration("");

        router.push("/admin/videos");
      }
    } catch (error: unknown) {
      toast.dismiss();
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  if (session?.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-red-500 font-semibold">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-8 pt-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Add New Video</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Paste YouTube video link and add details
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* YouTube URL */}
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">YouTube Video</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">
                YouTube URL or Video ID *
              </label>
              <div className="relative">
                <Link
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://www.youtube.com/watch?v=xxxxx or just video ID"
                  disabled={isSubmitting}
                />
              </div>

              {youtubeVideoId ? (
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    Video ID: {youtubeVideoId}
                  </p>
                  <div className="mt-3 rounded-lg overflow-hidden border border-zinc-700">
                    <YouTube
                      videoId={youtubeVideoId}
                      onReady={handleYoutubeReady}
                      onError={handleYoutubeError}
                      opts={{
                        width: "100%",
                        height: "390",
                        playerVars: {
                          modestbranding: 1,
                          rel: 0,
                          playsinline: 1,
                        },
                      }}
                      iframeClassName="w-full aspect-video"
                      className="w-full"
                    />
                  </div>
                </div>
              ) : youtubeUrl ? (
                <p className="text-xs text-red-500 mt-1">Invalid YouTube URL</p>
              ) : null}
            </div>
          </div>

          {/* Video Details */}
          <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-lg font-bold">Video Details</h2>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                placeholder="Enter video title"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                maxLength={5000}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                placeholder="Description"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  disabled={isSubmitting}>
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="tag1, tag2"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">Duration</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Duration (seconds) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                placeholder="Auto detected after video loads"
                disabled={isSubmitting}
              />
              {duration && (
                <p className="text-xs text-gray-500 mt-1">
                  = {Math.floor(parseInt(duration) / 60)}:
                  {(parseInt(duration) % 60).toString().padStart(2, "0")}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4">Thumbnail *</h2>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setThumbnailMode("youtube");
                  if (youtubeVideoId) {
                    setThumbnailUrl(
                      `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`,
                    );
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  thumbnailMode === "youtube"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-700"
                }`}>
                YouTube Auto
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode("upload")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  thumbnailMode === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-zinc-700"
                }`}>
                Upload
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode("url")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  thumbnailMode === "url"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-zinc-700"
                }`}>
                URL
              </button>
            </div>

            {thumbnailMode === "youtube" && (
              <div>
                {youtubeVideoId ? (
                  <div>
                    <Image
                      src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                      width={320}
                      height={180}
                      alt="YouTube Thumbnail"
                      unoptimized
                      className="w-full rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
                      }}
                    />
                    <p className="text-xs text-green-500 mt-2">
                      YouTube thumbnail auto-selected
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Paste YouTube URL first to auto-load thumbnail
                  </p>
                )}
              </div>
            )}

            {thumbnailMode === "upload" && (
              <>
                <input
                  id={`thumb-${thumbnailKey}`}
                  key={thumbnailKey}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor={`thumb-${thumbnailKey}`}
                  className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 flex flex-col items-center cursor-pointer hover:border-blue-500">
                  {thumbnailPreview ? (
                    <Image
                      src={thumbnailPreview}
                      alt="Thumb"
                      unoptimized
                      width={320}
                      height={180}
                      className="h-32 rounded object-cover"
                    />
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        Click to upload
                      </p>
                    </>
                  )}
                </label>
                {thumbnailPreview && (
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <X size={14} /> Remove
                  </button>
                )}
              </>
            )}

            {thumbnailMode === "url" && (
              <>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  placeholder="Paste image URL"
                />
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt="Preview"
                    unoptimized
                    width={320}
                    height={180}
                    className="mt-3 h-32 rounded object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                )}
              </>
            )}
          </div>

          {/* Publish */}
          <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                {formData.published ? (
                  <Eye size={20} className="text-green-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-400" />
                )}
                <div>
                  <p className="font-semibold">
                    {formData.published ? "Public" : "Draft"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.published ? "Everyone can see" : "Only you"}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleFormChange}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-lg">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Video
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
