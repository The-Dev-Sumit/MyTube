export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number; // in seconds

  // ✅ category sirf string hai - VideoCategory object nahi
  category: string;

  tags: string[];
  views: number;
  likes: number;
  dislikes: number;
  likedBy?: string[];
  dislikedBy?: string[];
  published: boolean;
  youtubeVideoId: string;
  uploadedBy?: string | User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  videoId: string;
  authorId: string;
  author: User;
  content: string;
  likes: number;
  likedBy?: string[];
  replies: Comment[];
  parentId?: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ VideoCategory interface theek hai
export interface VideoCategory {
  id: string;
  name: string;
  label: string;
}

export const CATEGORIES: VideoCategory[] = [
  { id: "all", name: "all", label: "All" },
  { id: "tech", name: "tech", label: "Tech" },
  { id: "gaming", name: "gaming", label: "Gaming" },
  { id: "music", name: "music", label: "Music" },
  { id: "education", name: "education", label: "Education" },
  { id: "entertainment", name: "entertainment", label: "Entertainment" },
  { id: "tutorial", name: "tutorial", label: "Tutorial" },
];

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Subscription {
  _id: string;
  subscriber: string | User;
  notificationsEnabled: boolean;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  recipient: string | User;
  type: "new_video";
  video: string | Video;
  title: string;
  thumbnail?: string;
  isRead: boolean;
  createdAt: Date;
}
