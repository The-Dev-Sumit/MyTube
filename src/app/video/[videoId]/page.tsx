"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import VideoPlayer from "@/components/VideoPlayer";
import { Video, Comment as CommentType } from "@/types";
import { formatDate, formatViewCount } from "@/utils/formatters";
import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import SubscribeButton from "@/components/SubscribeButton";
import Link from "next/link";
import { parseLinks } from "@/utils/parseLink";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

export default function WatchPage({ params }: PageProps) {
   const { videoId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showMobileRelated, setShowMobileRelated] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/videos/${videoId}`);
        setVideo(data.video);
        setRelatedVideos(data.related);

        if (session?.user) {
          setLiked(data.liked || false);
          setDisliked(data.disliked || false);
        }
      } catch (error: any) {
        toast.error("Failed to load video");
        console.error("Error fetching video:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, session?.user, router]);

  const handleLike = async (type: "like" | "dislike") => {
    if (!session) {
      toast.error("Please sign in to react");
      router.push("/auth/login");
      return;
    }

    try {
      // Sahi API call karo
      const endpoint =
        type === "like"
          ? `/api/videos/${videoId}/like`
          : `/api/videos/${videoId}/dislike`;

      const { data } = await axios.post(endpoint);

      // State update karo
      setVideo({
        ...video!,
        likes: data.likes,
        dislikes: data.dislikes,
      });
      setLiked(data.liked);
      setDisliked(data.disliked);
    } catch (error: any) {
      toast.error("Failed to react");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/video/${videoId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2  transition">
            <Image
              src="https://res.cloudinary.com/dmmzqpfgg/image/upload/v1777094241/My_Tube_logo_kjxfpb.png"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold text-lg">MyTube</span>
          </Link>
          <button
            onClick={() => setShowMobileRelated(!showMobileRelated)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
            aria-label="Toggle related videos">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* ================= MOBILE RELATED OVERLAY ================= */}
      {showMobileRelated && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowMobileRelated(false)}
          />
          {/* Slide-in panel */}
          <div className="w-80 max-w-full bg-white dark:bg-zinc-950 h-full overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base">Related Videos</h2>
              <button
                onClick={() => setShowMobileRelated(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
                aria-label="Close related videos">
                <X size={18} />
              </button>
            </div>

            {relatedVideos.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No related videos
              </p>
            ) : (
              relatedVideos.map((relVideo) => (
                <div
                  key={relVideo._id}
                  onClick={() => {
                    router.push(`/video/${relVideo._id}`);
                    setShowMobileRelated(false);
                  }}
                  className="flex gap-2 hover:bg-gray-100 dark:hover:bg-zinc-900 p-2 rounded cursor-pointer transition">
                  <div className="relative w-24 h-14 shrink-0 bg-black rounded overflow-hidden">
                    <Image
                      src={relVideo.thumbnail}
                      alt={relVideo.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold line-clamp-2">
                      {relVideo.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatViewCount(relVideo.views)} views
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 pt-14 lg:pt-6 pb-20 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* ===== Main Video Section ===== */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <VideoPlayer
              youtubeVideoId={video.youtubeVideoId}
              thumbnail={video.thumbnail}
            />

            {/* Video Info */}
            <div className="mt-4 space-y-4">
              {/* Title */}
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2 lg:line-clamp-none">
                {video.title}
              </h1>

              {/* Channel + Subscribe + Actions (same align for mobile/desktop) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Channel + Subscribe (left) */}
                <div className="flex items-center gap-3">
                  <Image
                    src="https://res.cloudinary.com/dmmzqpfgg/image/upload/v1776967553/The_Better_Way_Logo_fsu0ox.png"
                    width={40}
                    height={40}
                    alt="Channel Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-12">
                    <p className="text-base font-medium">The Better Way</p>
                    <SubscribeButton showCount={true} />
                  </div>
                </div>

                {/* Like / Dislike / Share (right) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <button
                    onClick={() => handleLike("like")}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition whitespace-nowrap ${
                      liked ? "bg-gray-100 dark:bg-zinc-800" : ""
                    }`}
                    title="Like">
                    <ThumbsUp
                      size={16}
                      className={liked ? "fill-current" : ""}
                    />
                    <span className="text-sm font-medium">
                      {formatViewCount(video.likes)}
                    </span>
                  </button>

                  <button
                    onClick={() => handleLike("dislike")}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition whitespace-nowrap ${
                      disliked ? "bg-gray-100 dark:bg-zinc-800" : ""
                    }`}
                    title="Dislike">
                    <ThumbsDown
                      size={16}
                      className={disliked ? "fill-current" : ""}
                    />
                    <span className="text-sm font-medium">
                      {formatViewCount(video.dislikes)}
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition whitespace-nowrap"
                    title="Share">
                    <Share2 size={16} />
                    <span className="text-sm font-medium hidden sm:inline">
                      Share
                    </span>
                  </button>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto whitespace-nowrap">
                <span>{formatViewCount(video.views)} views</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
                {video.category && video.category !== "all" && (
                  <>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-xs">
                      {video.category}
                    </span>
                  </>
                )}
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="shrink-0 text-xs bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-xl">
                <div
                  className={`text-sm leading-relaxed whitespace-break-spaces text-gray-700 dark:text-gray-300 ${
                    !showDescription ? "line-clamp-2" : ""
                  }`}>
                  {video.description
                    ? parseLinks(video.description)
                    : "No description available"}
                </div>
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="text-blue-600 dark:text-blue-400 text-sm mt-2 hover:underline">
                  {showDescription ? "Show less" : "Show more"}
                </button>
              </div>

              {/* Comments Section (sabko dikhega) */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Comments</h2>
                <CommentSection videoId={videoId} />
              </div>
            </div>
          </div>

          {/* ===== Desktop Sidebar (same) ===== */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0 max-h-[calc(100vh-100px)] overflow-y-auto sticky top-24 space-y-3">
            <h2 className="font-bold text-lg mb-2">Up Next</h2>
            {relatedVideos.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No related videos
              </p>
            ) : (
              relatedVideos.map((relVideo) => (
                <div
                  key={relVideo._id}
                  onClick={() => router.push(`/video/${relVideo._id}`)}
                  className="flex gap-3 hover:bg-gray-100 dark:hover:bg-zinc-900 p-2 rounded-lg cursor-pointer transition">
                  <div className="relative w-36 h-20 shrink-0 bg-black rounded-lg overflow-hidden">
                    <Image
                      src={relVideo.thumbnail}
                      alt={relVideo.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {relVideo.title}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>{formatViewCount(relVideo.views)} views</p>
                      <p>{formatDate(relVideo.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
