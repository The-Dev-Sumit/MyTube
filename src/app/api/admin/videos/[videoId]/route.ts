import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import { Comment } from "@/models/Comment";
import { authConfig } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authConfig);
  return session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

// DELETE video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId } = await params;
    await connectDB();

    // Video delete
    const deleted = await Video.findByIdAndDelete(videoId);

    if (!deleted) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Us video ke saare comments bhi delete
    await Comment.deleteMany({ videoId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin video DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 },
    );
  }
}

// PATCH - publish/unpublish toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId } = await params;
    const { published } = await request.json();

    await connectDB();

    const video = await Video.findByIdAndUpdate(
      videoId,
      { published: !published },
      { new: true },
    );

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ published: video.published });
  } catch (error) {
    console.error("Admin video PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 },
    );
  }
}
