import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    await params;
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID required" },
        { status: 400 },
      );
    }

    const userId = new mongoose.Types.ObjectId((session.user as any).id);
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // ✅ Toggle like
    const alreadyLiked = comment.likedBy.some((id: any) => id.equals(userId));

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter((id: any) => !id.equals(userId));
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    return NextResponse.json({
      likes: comment.likes,
      isLiked: !alreadyLiked,
    });
  } catch (error: any) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
