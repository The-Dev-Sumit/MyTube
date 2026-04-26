"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, Pin, PinOff, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/utils/formatters";

// Admin comment type (backend se jo aayega)
interface AdminComment {
  _id: string;
  content: string;
  likes: number;
  pinned: boolean;
  createdAt: string;
  repliesCount: number;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  video: {
    _id: string;
    title: string;
  };
}

export default function ManageCommentsPage() {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);

  // ✅ isAdmin variable — return ke pehle define karo
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // ✅ useEffect HAMESHA yahan hoga — kisi bhi return ke pehle
  useEffect(() => {
    // Guard andar lagao, bahar nahi
    if (status === "loading") return;
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/admin/comments");
        setComments(data.comments || []);
      } catch (error) {
        console.error("Failed to load comments:", error);
        toast.error("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [status, isAdmin]);

  // ✅ Handlers bhi hooks ke baad, return ke pehle
  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment and its replies?")) return;

    try {
      setDeletingId(commentId);
      await axios.delete(`/api/admin/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePin = async (commentId: string, currentPinned: boolean) => {
    try {
      setPinningId(commentId);
      const { data } = await axios.patch(`/api/admin/comments/${commentId}`, {
        pinned: currentPinned,
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, pinned: data.pinned } : c,
        ),
      );
      toast.success(data.pinned ? "Comment pinned" : "Comment unpinned");
    } catch (error) {
      console.error("Pin error:", error);
      toast.error("Failed to update comment");
    } finally {
      setPinningId(null);
    }
  };

  // ✅ Conditional returns SAARE hooks ke baad
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center pt-20">
        <p>Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 px-4 py-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={28} className="text-orange-500" />
            <h1 className="text-3xl font-bold">Moderate Comments</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {comments.length} total comments
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-12 text-center">
            <MessageCircle
              size={40}
              className="mx-auto mb-3 text-gray-400 opacity-50"
            />
            <p className="text-gray-600 dark:text-gray-400">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 transition ${
                  comment.pinned
                    ? "border-yellow-400 dark:border-yellow-600"
                    : "border-gray-200 dark:border-zinc-800"
                }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <Image
                      src={comment.author?.image || "/default-avatar.png"}
                      alt={comment.author?.name || "User"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">
                          {comment.author?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {comment.author?.email}
                        </p>
                        {comment.pinned && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            📌 Pinned
                          </span>
                        )}
                      </div>

                      <p className="text-sm mt-1.5 text-gray-800 dark:text-gray-200">
                        {comment.content}
                      </p>

                      <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                        <span>👍 {comment.likes || 0} likes</span>
                        <span>💬 {comment.repliesCount} replies</span>
                        <span>🕐 {formatDate(comment.createdAt)}</span>
                        {comment.video && (
                          <Link
                            href={`/video/${comment.video._id}`}
                            className="text-blue-500 hover:underline truncate max-w-xs">
                            📹 {comment.video.title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handlePin(comment._id, comment.pinned)}
                      disabled={pinningId === comment._id}
                      className={`p-2 rounded-lg transition ${
                        comment.pinned
                          ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          : "text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      }`}
                      title={comment.pinned ? "Unpin" : "Pin"}>
                      {pinningId === comment._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-yellow-500" />
                      ) : comment.pinned ? (
                        <PinOff size={18} />
                      ) : (
                        <Pin size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(comment._id)}
                      disabled={deletingId === comment._id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      title="Delete">
                      {deletingId === comment._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-500" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
