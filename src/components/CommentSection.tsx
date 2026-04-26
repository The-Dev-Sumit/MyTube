"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ThumbsUp,
  MessageCircle,
  Trash2,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/utils/formatters";

interface Author {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface CommentData {
  _id: string;
  content: string;
  author: Author;
  authorId: any;
  likes: number;
  isLiked: boolean;
  pinned: boolean;
  replies: CommentData[];
  createdAt: string;
}

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [totalComments, setTotalComments] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // ✅ Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/videos/${videoId}/comment`, {
          params: { page: 1, limit: 20, sort: sortBy },
        });
        setComments(data.comments);
        setTotalComments(data.total);
        setHasMore(data.pages > 1);
        setPage(1);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [videoId, sortBy]);

  // ✅ Load more comments
  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const { data } = await axios.get(`/api/videos/${videoId}/comments`, {
        params: { page: nextPage, limit: 20, sort: sortBy },
      });
      setComments((prev) => [...prev, ...data.comments]);
      setPage(nextPage);
      setHasMore(data.pages > nextPage);
    } catch (error) {
      toast.error("Failed to load more comments");
    }
  };

  // ✅ Post comment
  const handleSubmitComment = async () => {
    if (!session) {
      toast.error("Please sign in to comment");
      router.push("/auth/login");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`/api/videos/${videoId}/comment`, {
        content: newComment.trim(),
      });
      setComments((prev) => [data.comment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Post reply
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast.error("Please sign in to reply");
      return;
    }

    if (!replyContent.trim()) return;

    try {
      const { data } = await axios.post(`/api/videos/${videoId}/comment`, {
        content: replyContent.trim(),
        parentId,
      });

      // Add reply to parent comment
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: [...c.replies, data.comment] }
            : c,
        ),
      );

      setReplyContent("");
      setReplyingTo(null);
      setExpandedReplies((prev) => new Set(prev).add(parentId));
      toast.success("Reply posted!");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to reply");
    }
  };

  // ✅ Toggle like
  const handleLikeComment = async (
    commentId: string,
    isReply = false,
    parentId?: string,
  ) => {
    if (!session) {
      toast.error("Please sign in");
      return;
    }

    try {
      const { data } = await axios.post(`/api/videos/${videoId}/comment/like`, {
        commentId,
      });

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r._id === commentId
                      ? { ...r, likes: data.likes, isLiked: data.isLiked }
                      : r,
                  ),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, likes: data.likes, isLiked: data.isLiked }
              : c,
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to like");
    }
  };

  // ✅ Delete comment
  const handleDelete = async (
    commentId: string,
    isReply = false,
    parentId?: string,
  ) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await axios.delete(
        `/api/videos/${videoId}/comment?commentId=${commentId}`,
      );

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== commentId),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setTotalComments((prev) => prev - 1);
      }

      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // ✅ Pin comment (admin only)
  const handlePin = async (commentId: string) => {
    try {
      const { data } = await axios.post(`/api/videos/${videoId}/comment/pin`, {
        commentId,
      });

      setComments((prev) => {
        const updated = prev.map((c) =>
          c._id === commentId ? { ...c, pinned: data.pinned } : c,
        );
        // Pinned comments pehle
        return updated.sort((a, b) =>
          a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1,
        );
      });

      toast.success(data.pinned ? "Comment pinned!" : "Comment unpinned");
    } catch (error) {
      toast.error("Failed to pin");
    }
  };

  // ✅ Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  // ═══════ SINGLE COMMENT COMPONENT ═══════
  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: {
    comment: CommentData;
    isReply?: boolean;
    parentId?: string;
  }) => {
    const isAuthor =
      (session?.user as any)?.id === comment.authorId?._id?.toString() ||
      (session?.user as any)?.id === comment.authorId?.toString();

    return (
      <div className="flex gap-3 mb-8 items-start">
        {/* Avatar */}
        <Image
          src={comment.author?.image || "/avatar.png"}
          width={28}
          height={28}
          alt={comment.author?.name || "User"}
          className="rounded-full shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {comment.pinned && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <Pin size={12} /> Pinned
              </span>
            )}
            <span className="text-sm font-semibold">
              {comment.author?.name || "Unknown"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm mt-1 text-start whitespace-pre-wrap wrap-break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            {/* Like */}
            <button
              onClick={() => handleLikeComment(comment._id, isReply, parentId)}
              className="flex items-center gap-1 text-xs hover:text-blue-500 transition">
              <ThumbsUp
                size={14}
                className={comment.isLiked ? "fill-current text-blue-500" : ""}
              />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {/* Reply button (sirf top-level pe) */}
            {!isReply && (
              <button
                onClick={() => {
                  if (!session) {
                    toast.error("Please sign in");
                    return;
                  }
                  setReplyingTo(
                    replyingTo === comment._id ? null : comment._id,
                  );
                  setReplyContent("");
                }}
                className="text-xs hover:text-blue-500 transition">
                Reply
              </button>
            )}

            {/* Delete (author ya admin) */}
            {(isAuthor || isAdmin) && (
              <button
                onClick={() => handleDelete(comment._id, isReply, parentId)}
                className="text-xs text-red-500 hover:text-red-600 transition">
                <Trash2 size={14} />
              </button>
            )}

            {/* Pin (admin only, top-level only) */}
            {isAdmin && !isReply && (
              <button
                onClick={() => handlePin(comment._id)}
                className="text-xs text-yellow-500 hover:text-yellow-600 transition">
                {comment.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment._id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Add a reply..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-full bg-transparent focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitReply(comment._id);
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => setReplyingTo(null)}
                className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
              <button
                onClick={() => handleSubmitReply(comment._id)}
                disabled={!replyContent.trim()}
                className="p-2 text-blue-500 disabled:text-gray-400">
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Replies Toggle */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => toggleReplies(comment._id)}
                className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                {expandedReplies.has(comment._id) ? (
                  <>
                    <ChevronUp size={16} /> Hide {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} /> View {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "reply" : "replies"}
                  </>
                )}
              </button>

              {/* Expanded Replies */}
              {expandedReplies.has(comment._id) &&
                comment.replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    isReply
                    parentId={comment._id}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════ MAIN RENDER ═══════
  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
        </h2>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-zinc-800 border dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="top">Top comments</option>
        </select>
      </div>

      {/* Comment Input */}
      <div className="flex gap-3 mb-8 items-start">
        <Image
          src={(session?.user as any)?.image || "/avatar.png"}
          width={36}
          height={36}
          alt="You"
          className="rounded-full shrink-0 mt-1"
        />
        <div className="flex-1">
          <textarea
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? "Add a comment..." : "Sign in to comment"}
            disabled={!session}
            rows={1}
            className="w-full px-2 py-2 text-sm bg-transparent border-b 
  border-gray-300 dark:border-zinc-700 focus:border-blue-500 
  focus:outline-none resize-none min-h-10"
            onBlur={(e) => {
              if (!newComment.trim()) {
                e.target.style.minHeight = "40px";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSubmitComment();
              }
            }}
          />

          {/* Submit buttons */}
          {newComment.trim() && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setNewComment("")}
                className="px-4 py-1.5 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Comment"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin mx-auto text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            No comments yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-2 text-sm text-blue-500 hover:text-blue-600">
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
