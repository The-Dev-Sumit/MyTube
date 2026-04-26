import { formatDistanceToNow } from "date-fns";

export const formatDate = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatViewCount = (views: number) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const truncate = (str: string, length: number) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};
