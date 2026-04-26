import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ✅ id use karo, ObjectId me convert karo
    const userId = new mongoose.Types.ObjectId((session.user as any).id);

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // ✅ Toggle like
    const alreadyLiked = video.likedBy.some((id: any) => id.equals(userId));

    if (alreadyLiked) {
      // Unlike karo
      video.likedBy = video.likedBy.filter((id: any) => !id.equals(userId));
      video.likes = Math.max(0, video.likes - 1);
    } else {
      // Like karo
      video.likedBy.push(userId);
      video.likes += 1;

      // Dislike tha to remove karo
      const alreadyDisliked = video.dislikedBy.some((id: any) =>
        id.equals(userId),
      );
      if (alreadyDisliked) {
        video.dislikedBy = video.dislikedBy.filter(
          (id: any) => !id.equals(userId),
        );
        video.dislikes = Math.max(0, video.dislikes - 1);
      }
    }

    await video.save();

    // ✅ Fresh check after save
    const nowLiked = video.likedBy.some((id: any) => id.equals(userId));
    const nowDisliked = video.dislikedBy.some((id: any) => id.equals(userId));

    return NextResponse.json({
      likes: video.likes,
      dislikes: video.dislikes,
      liked: nowLiked,
      disliked: nowDisliked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
