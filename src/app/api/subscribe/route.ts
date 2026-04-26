import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";

// GET - Check karo subscribed hai ya nahi + total count
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authConfig);

    // Total subscriber count
    const subscriberCount = await Subscription.countDocuments();

    // Agar logged in nahi hai
    if (!session?.user?.id) {
      return NextResponse.json({
        isSubscribed: false,
        subscriberCount,
        notificationsEnabled: false,
      });
    }

    // Check karo yeh user subscribed hai ya nahi
    const subscription = await Subscription.findOne({
      subscriber: session.user.id,
    });

    return NextResponse.json({
      isSubscribed: !!subscription,
      subscriberCount,
      notificationsEnabled: subscription?.notificationsEnabled ?? true,
    });
  } catch (error) {
    console.error("Subscribe GET error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST - Subscribe / Unsubscribe toggle
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await request.json();
    const { fcmToken } = body; // Optional - frontend se aayega

    // Check existing subscription
    const existing = await Subscription.findOne({
      subscriber: session.user.id,
    });

    if (existing) {
      // Already subscribed hai - UNSUBSCRIBE karo
      await Subscription.deleteOne({ subscriber: session.user.id });

      const subscriberCount = await Subscription.countDocuments();

      return NextResponse.json({
        isSubscribed: false,
        subscriberCount,
        message: "Unsubscribed successfully",
      });
    } else {
      // Subscribe karo
      await Subscription.create({
        subscriber: session.user.id,
        notificationsEnabled: true,
      });

      // FCM token save karo agar mila
      if (fcmToken) {
        await User.findByIdAndUpdate(session.user.id, {
          fcmToken,
          notificationsEnabled: true,
        });
      }

      const subscriberCount = await Subscription.countDocuments();

      return NextResponse.json({
        isSubscribed: true,
        subscriberCount,
        message: "Subscribed successfully",
      });
    }
  } catch (error) {
    console.error("Subscribe POST error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
