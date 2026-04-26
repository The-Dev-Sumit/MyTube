
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import mongoose from "mongoose";
import {connectDB} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Admin check
    const session = await getServerSession(authConfig);
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!session?.user || session.user.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // MongoDB connect
    await connectDB();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 },
      );
    }

    // Total Videos
    const totalVideos = await db.collection("videos").countDocuments();

    // Total Views (sab videos ke views ka sum)
    const viewsResult = await db
      .collection("videos")
      .aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
          },
        },
      ])
      .toArray();

    const totalViews = viewsResult[0]?.totalViews || 0;

    // Total Comments
    const totalComments = await db.collection("comments").countDocuments();

    // Total Users
    const totalUsers = await db.collection("users").countDocuments();

    // Total Likes (sab videos ke likes ka sum)
    const likesResult = await db
      .collection("videos")
      .aggregate([
        {
          $group: {
            _id: null,
            totalLikes: { $sum: "$likes" },
          },
        },
      ])
      .toArray();

    const totalLikes = likesResult[0]?.totalLikes || 0;

    // Total Subscribers
    const totalSubscribers = await db
      .collection("subscribers")
      .countDocuments();

    return NextResponse.json({
      totalVideos,
      totalViews,
      totalComments,
      totalUsers,
      totalLikes,
      totalSubscribers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
