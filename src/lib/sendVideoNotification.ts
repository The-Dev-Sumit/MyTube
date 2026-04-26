import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { Notification } from "@/models/Notification";

interface VideoData {
  _id: string;
  title: string;
  thumbnail: string;
}

export async function sendVideoNotification(video: VideoData) {
  try {
    await connectDB();

    // Saare subscribers fetch karo
    const subscribers = await Subscription.find({
      notificationsEnabled: true,
    }).select("subscriber");

    if (subscribers.length === 0) {
      console.log("No subscribers to notify");
      return { notified: 0 };
    }

    // Saare subscribers ke liye ek saath notifications create karo
    const notifications = subscribers.map((sub) => ({
      recipient: sub.subscriber,
      type: "new_video",
      video: video._id,
      title: video.title,
      thumbnail: video.thumbnail,
      isRead: false,
    }));

    // Bulk insert - efficient hai
    await Notification.insertMany(notifications);

    console.log(`Notified ${subscribers.length} subscribers`);

    return { notified: subscribers.length };
  } catch (error) {
    // Notification fail hone pe video upload fail nahi honi chahiye
    // Isliye error throw nahi kar rahe, sirf log kar rahe hain
    console.error("Notification error:", error);
    return { notified: 0 };
  }
}
