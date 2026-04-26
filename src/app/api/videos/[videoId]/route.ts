import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import { Comment } from "@/models/Comment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    await connectDB();

    // Get video
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true },
    ).lean();

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Get related videos (same category)
    const related = await Video.find({
      category: video.category,
      _id: { $ne: videoId },
      published: true,
    })
      .limit(10)
      .lean();

    // Get comment count
    const commentCount = await Comment.countDocuments({
      videoId,
      parentId: null,
    });

    return NextResponse.json({
      video,
      related,
      commentCount,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 },
    );
  }
}
