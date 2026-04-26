"use client";

import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import type { YouTubeProps } from "react-youtube";
import { Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  youtubeVideoId: string;
  thumbnail: string;
}

export default function VideoPlayer({
  youtubeVideoId,
  thumbnail,
}: VideoPlayerProps) {
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const onError: YouTubeProps["onError"] = () => {
    console.error("YouTube player error");
  };

useEffect(() => {
  const handleFullscreenChange = async () => {
    const isNowFullscreen =
      document.fullscreenElement === playerWrapperRef.current;

    setIsFullscreen(isNowFullscreen);

    if (!isNowFullscreen) {
      try {
        const orientation = screen.orientation as any;
        orientation?.unlock?.();
      } catch (error) {
        console.log("Orientation unlock not supported");
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);

const handleMobileFullscreen = async () => {
  const element = playerWrapperRef.current;
  if (!element) return;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();

      try {
        const orientation = screen.orientation as any;
        orientation?.unlock?.();
      } catch (error: any) {
        console.log("Orientation unlock not supported");
        console.error("Orientation unlock error:", error);
      }

      return;
    }

    await element.requestFullscreen();

    try {
      const orientation = screen.orientation as any;
      await orientation?.lock?.("landscape");
    } catch (error: any) {
      console.error("Landscape lock error:", error);
      console.log("Landscape lock not supported on this device/browser");
    }
  } catch (error: any) {
    console.error("Fullscreen error:", error);
  }
};

  return (
    <div
      ref={playerWrapperRef}
      className={`relative w-full bg-black overflow-hidden ${
        isFullscreen
          ? "h-screen w-screen rounded-none"
          : "aspect-video rounded-xl"
      }`}>
      <div className="absolute top-1 left-3 h-12 w-56 lg:top-2 lg:left-2 lg:h-14 lg:w-[42rem] bg-transparent z-20" />
      <div className="absolute bottom-1 right-0 h-12 w-full lg:right-0 lg:bottom-1 lg:h-14 lg:w-full bg-transparent z-20" />

      <button
        type="button"
        onClick={handleMobileFullscreen}
        className="absolute top-13 right-3 z-30 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-white backdrop-blur lg:hidden"
        aria-label="Toggle fullscreen">
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>

      <YouTube
        videoId={youtubeVideoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
          },
        }}
        onError={onError}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
