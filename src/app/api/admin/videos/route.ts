import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import { authConfig } from "@/lib/auth";
import { sendVideoNotification } from "@/lib/sendVideoNotification";

async function isAdmin() {
  const session = await getServerSession(authConfig);
  return session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}

export async function GET(request: NextRequest) {
  try {
if (!(await isAdmin())) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
    await connectDB();

    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Admin videos GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 },
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 },
      );
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access only" },
        { status: 403 },
      );
    }

    await connectDB();
    const body = await request.json();

    // ✅ Debug log lagao temporarily
    console.log("Received body:", body);

    // ✅ `videos` ki jagah `youtubeVideoId` check karo
    if (!body.title || !body.thumbnail || !body.youtubeVideoId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          // ✅ Exactly kya missing hai wo batao
          missing: {
            title: !body.title,
            thumbnail: !body.thumbnail,
            youtubeVideoId: !body.youtubeVideoId,
          },
        },
        { status: 400 },
      );
    }

    const video = new Video({
      title: body.title,
      description: body.description || "",
      thumbnail: body.thumbnail,
      duration: body.duration || 0,
      category: body.category || "tech",
      tags: body.tags || [],
      youtubeVideoId: body.youtubeVideoId, // ✅ Correct field
      published: body.published || false,
      views: 0,
      likes: 0,
      dislikes: 0,
    });

    const savedVideo = await video.save();

     if (savedVideo.published) {
       await sendVideoNotification({
         _id: savedVideo._id.toString(),
         title: savedVideo.title,
         thumbnail: savedVideo.thumbnail,
       });
     }

    return NextResponse.json(
      { message: "Success", video: savedVideo },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Video save error:", error);
    return NextResponse.json(
      {
        error: error.message,
        // ✅ MongoDB validation errors bhi dikhao
        details: error.errors || null,
      },
      { status: 500 },
    );
  }
}
