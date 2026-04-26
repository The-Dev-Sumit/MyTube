import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { authConfig } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authConfig);
  return session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// DELETE - comment + uske replies delete karo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    await connectDB();

    // Pehle check karo comment exist karta hai
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Comment ke replies bhi delete karo
    await Comment.deleteMany({ parentId: commentId });

    // Comment khud delete karo
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin comment DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}

// PATCH - pin/unpin toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;
    const { pinned } = await request.json();

    await connectDB();

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { pinned: !pinned },
      { new: true },
    );

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pinned: comment.pinned });
  } catch (error) {
    console.error("Admin comment PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 },
    );
  }
}
