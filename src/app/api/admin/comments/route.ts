import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { authConfig } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authConfig);
  return session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// GET - saare comments fetch karo with author + video details
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Saare top-level comments fetch karo (parentId nahi hai)
    const comments = await Comment.find({})
      .populate("authorId", "name email image")
      .populate("videoId", "title")
      .sort({ createdAt: -1 })
      .lean();

    // Har comment ke replies count nikalo
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const repliesCount = await Comment.countDocuments({
          parentId: comment._id,
        });
        return {
          ...comment,
          author: comment.authorId, // populate ke baad authorId me user object aata hai
          video: comment.videoId, // populate ke baad videoId me video object aata hai
          repliesCount,
        };
      }),
    );

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    console.error("Admin comments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
