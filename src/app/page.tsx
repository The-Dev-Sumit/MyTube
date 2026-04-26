"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { Video, CATEGORIES } from "@/types";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

function Home() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/videos", {
          params: {
            search,
            category: category === "all" ? undefined : category,
            page,
            limit: 20,
          },
        });

        setVideos((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
        setHasMore(data.pages > page);
      } catch (error: any) {
        toast.error("Failed to load videos");
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [search, category, page]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="sticky top-1 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-40 overflow-x-auto">
        <div className="flex gap-3 px-4 py-3 max-w-full">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={cat.id === "all" ? "/" : `/?category=${cat.id}`}
              className={`p-2 rounded-full whitespace-nowrap transition text-[12px] font-medium ${
                category === cat.id || (cat.id === "all" && !category)
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700"
              }`}>
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-full px-4 py-8">
        {videos.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No videos found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-200 dark:bg-zinc-800 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-700 transition disabled:opacity-50">
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {isLoading && page === 1 && (
              <div className="text-center py-12">
                <Loader2
                  size={40}
                  className="animate-spin mx-auto text-gray-600 dark:text-gray-400"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function HomeContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2
              size={40}
              className="animate-spin text-gray-600 dark:text-gray-400"
            />
          </div>
        }>
        <Home />
      </Suspense>
    </div>
  );
}