import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import mongoose from "mongoose";

// ✅ GET - Fetch comments for a video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, top

    // ✅ Sirf top-level comments (parentId null)
    const query = {
      videoId: new mongoose.Types.ObjectId(videoId),
      parentId: { $exists: false },
    };

    // Sort options
    let sortOption: any = { createdAt: -1 }; // newest
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "top") sortOption = { likes: -1, createdAt: -1 };

    // ✅ Pinned comments pehle aayenge
    const total = await Comment.countDocuments(query);

    const comments = await Comment.find(query)
      .sort({ pinned: -1, ...sortOption })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("authorId", "name email image")
      .lean();

    // ✅ Har comment ke replies bhi fetch karo
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .sort({ createdAt: 1 })
          .populate("authorId", "name email image")
          .lean();

        return {
          ...comment,
          author: comment.authorId, // rename for frontend
          replies: replies.map((reply) => ({
            ...reply,
            author: reply.authorId,
          })),
        };
      }),
    );

    // ✅ Current user ka like status check karo
    const session = await getServerSession(authConfig);
    const userId = (session?.user as any)?.id;

    const finalComments = commentsWithReplies.map((comment) => ({
      ...comment,
      isLiked: userId
        ? comment.likedBy?.some(
            (id: any) => id.toString() === userId.toString(),
          )
        : false,
      replies: comment.replies.map((reply: any) => ({
        ...reply,
        isLiked: userId
          ? reply.likedBy?.some(
              (id: any) => id.toString() === userId.toString(),
            )
          : false,
      })),
    }));

    return NextResponse.json({
      comments: finalComments,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

// ✅ POST - Add new comment or reply
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

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 },
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Comment too long (max 1000 chars)" },
        { status: 400 },
      );
    }

    const userId = (session.user as any).id;

    // ✅ Agar reply hai to check karo parent exist karta hai
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 },
        );
      }
      // ✅ Nested reply nahi - sirf 1 level deep
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: "Cannot reply to a reply" },
          { status: 400 },
        );
      }
    }

    const comment = new Comment({
      videoId: new mongoose.Types.ObjectId(videoId),
      authorId: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : undefined,
    });

    await comment.save();

    // ✅ Populated comment return karo
    const populated = await Comment.findById(comment._id)
      .populate("authorId", "name email image")
      .lean();

    return NextResponse.json(
      {
        comment: {
          ...populated,
          author: (populated as any).authorId,
          replies: [],
          isLiked: false,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}

// ✅ DELETE - Delete comment (author ya admin)
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID required" },
        { status: 400 },
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isAuthor = comment.authorId.toString() === userId;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // ✅ Replies bhi delete karo
    await Comment.deleteMany({ parentId: commentId });
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
