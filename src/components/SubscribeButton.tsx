"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface SubscribeButtonProps {
  // Subscriber count display karna hai ya nahi
  showCount?: boolean;
}

export default function SubscribeButton({
  showCount = true,
}: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Fetch current status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get("/api/subscribe");
        setIsSubscribed(data.isSubscribed);
        setSubscriberCount(data.subscriberCount);
      } catch (error) {
        console.error("Failed to fetch subscription status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [session]);

  const handleSubscribe = async () => {
    // Login check
    if (!session) {
      toast.error("Please sign in to subscribe");
      router.push("/auth/login");
      return;
    }

    setIsToggling(true);

    try {
      // FCM token lene ki koshish karo (optional)
      let fcmToken = null;
      // FCM baad mein add karenge - Step 4 mein

      const { data } = await axios.post("/api/subscribe", { fcmToken });

      setIsSubscribed(data.isSubscribed);
      setSubscriberCount(data.subscriberCount);

      if (data.isSubscribed) {
        toast.success("Subscribed! 🔔 You'll get notified of new videos");
      } else {
        toast.success("Unsubscribed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsToggling(false);
    }
  };

  // Format subscriber count - YouTube style
  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main Subscribe Button */}
      <button
        onClick={handleSubscribe}
        disabled={isToggling}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm
          transition-all duration-200 disabled:opacity-70
          ${
            isSubscribed
              ? // Subscribed state - gray (YouTube style)
                "bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-600"
              : // Not subscribed - Red (YouTube style)
                "bg-red-600 text-white hover:bg-red-700"
          }
        `}>
        {/* Bell Icon */}
        {isSubscribed ? (
          <Bell size={16} className="fill-current" />
        ) : (
          <BellOff size={16} />
        )}

        {/* Button Text */}
        <span>
          {isToggling ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
        </span>

        {/* Subscriber Count */}
        {showCount && subscriberCount > 0 && (
          <span className="text-xs opacity-75">
            {formatCount(subscriberCount)}
          </span>
        )}
      </button>
    </div>
  );
}
