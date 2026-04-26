// app/admin/videos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Trash2,
  Eye,
  EyeOff,
  Video as VideoIcon,
  ExternalLink,
} from "lucide-react";
import { Video } from "@/types";
import Image from "next/image";
import {
  formatDate,
  formatViewCount,
  formatDuration,
} from "@/utils/formatters";

export default function ManageVideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Auth loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
      </div>
    );
  }

  // Admin check
  if (session?.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center pt-20">
        <p>Access denied</p>
      </div>
    );
  }

  // ✅ REAL API CALL — videos fetch karo
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/admin/videos");
        setVideos(data.videos || []);
      } catch (error) {
        console.error("Failed to load videos:", error);
        toast.error("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // ✅ REAL DELETE — video delete karo
  const handleDelete = async (videoId: string) => {
    if (!confirm("Delete this video and all its comments?")) return;

    try {
      setDeletingId(videoId);
      await axios.delete(`/api/admin/videos/${videoId}`);

      // UI se bhi hata do
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ REAL PUBLISH TOGGLE
  const handleTogglePublish = async (
    videoId: string,
    currentPublished: boolean,
  ) => {
    try {
      setTogglingId(videoId);
      const { data } = await axios.patch(`/api/admin/videos/${videoId}`, {
        published: currentPublished,
      });

      // UI update
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, published: data.published } : v,
        ),
      );
      toast.success(data.published ? "Video published" : "Video unpublished");
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Failed to update video");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Videos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {videos.length} total videos
            </p>
          </div>
          <Link
            href="/admin/upload"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium">
            + Upload Video
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-gray-200 dark:bg-zinc-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-12 text-center">
            <VideoIcon
              size={40}
              className="mx-auto mb-3 text-gray-400 opacity-50"
            />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No videos yet
            </p>
            <Link
              href="/admin/upload"
              className="text-blue-600 hover:underline">
              Upload your first video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-32 h-20 shrink-0 bg-black rounded-lg overflow-hidden">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                      {video.title}
                    </h3>

                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>{formatViewCount(video.views)} views</span>
                      <span>{video.likes} likes</span>
                      <span>{formatDate(video.createdAt)}</span>
                      <span className="capitalize">{video.category}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {/* Publish Toggle */}
                      <button
                        onClick={() =>
                          handleTogglePublish(video._id, video.published)
                        }
                        disabled={togglingId === video._id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                          video.published
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200"
                        }`}>
                        {togglingId === video._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-current" />
                        ) : video.published ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {video.published ? "Published" : "Draft"}
                      </button>

                      {/* View Button */}
                      <Link
                        href={`/video/${video._id}`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 transition">
                        <ExternalLink size={12} />
                        View
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(video._id)}
                        disabled={deletingId === video._id}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition">
                        {deletingId === video._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-red-500" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
