"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Upload,
  Video,
  MessageCircle,
  Eye,
  Users,
  ThumbsUp,
  Bell,
} from "lucide-react";

interface AdminStats {
  totalVideos: number;
  totalViews: number;
  totalComments: number;
  totalUsers: number;
  totalLikes: number;
  totalSubscribers: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    totalVideos: 0,
    totalViews: 0,
    totalComments: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalSubscribers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Admin check
  useEffect(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!session?.user || session.user.email !== adminEmail) {
      router.push("/");
    }
  }, [session, router]);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/admin/stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your MyTube channel and content
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Videos */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Video size={18} className="text-blue-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalVideos}</p>
            )}
          </div>

          {/* Total Views */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">
                {formatNumber(stats.totalViews)}
              </p>
            )}
          </div>

          {/* Total Comments */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={18} className="text-orange-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comments
              </p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalComments}</p>
            )}
          </div>

          {/* Total Users */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-purple-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            )}
          </div>

          {/* Total Likes */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp size={18} className="text-red-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">
                {formatNumber(stats.totalLikes)}
              </p>
            )}
          </div>

          {/* Total Subscribers */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={18} className="text-yellow-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Subscribers
              </p>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/upload"
            className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-lg transition">
            <Upload size={32} className="text-blue-600" />
            <div>
              <h3 className="font-semibold">Upload Video</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new video
              </p>
            </div>
          </Link>

          <Link
            href="/admin/videos"
            className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-lg transition">
            <Video size={32} className="text-green-600" />
            <div>
              <h3 className="font-semibold">Manage Videos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit or delete videos
              </p>
            </div>
          </Link>

          <Link
            href="/admin/comments"
            className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-lg transition">
            <MessageCircle size={32} className="text-orange-600" />
            <div>
              <h3 className="font-semibold">Moderate Comments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review and manage comments
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Number formatter (1000 → 1K, 1000000 → 1M)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
