"use client";

import Link from "next/link";
import { Video } from "@/types";
import {
  formatDate,
  formatViewCount,
  formatDuration,
} from "@/utils/formatters";
import { Play } from "lucide-react";
import Image from "next/image";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video._id}`} className="group cursor-pointer">
      <div className="relative w-full aspect-video bg-black overflow-hidden rounded-xl">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          unoptimized
          loading="eager"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition duration-300 z-20"
          onError={(e) => {
            // ✅ Fallback agar thumbnail fail ho
            (e.target as HTMLImageElement).src =
              `https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;
          }}
        />
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-semibold">
          {formatDuration(video.duration)}
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition">
          <Play
            size={48}
            className="text-white opacity-0 group-hover:opacity-100 transition fill-white"
          />
        </div>
      </div>

      {/* Video Info */}
      <div className="pt-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition">
          {video.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {formatViewCount(video.views)} views • {formatDate(video.createdAt)}
        </p>
        {video.category !== "all" && (
          <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
            {video.category}
          </span>
        )}
      </div>
    </Link>
  );
}
