import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

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

    // ✅ Sirf admin pin kar sakta hai
    if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    await connectDB();

    const { commentId } = await request.json();
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // ✅ Toggle pin
    comment.pinned = !comment.pinned;
    await comment.save();

    return NextResponse.json({
      pinned: comment.pinned,
    });
  } catch (error: any) {
    console.error("Error pinning comment:", error);
    return NextResponse.json(
      { error: "Failed to pin comment" },
      { status: 500 },
    );
  }
}
