import axios from "axios";

export interface CloudinaryResponse {
  public_id: string;
  url: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  duration?: number;
  height?: number;
  width?: number;
}

export async function uploadToCloudinary(
  file: File,
  resourceType: "video" | "image",
  folder: string = "mytube",
  onProgress?: (progress: number) => void,
): Promise<CloudinaryResponse> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME missing in .env.local");
  }

  if (!uploadPreset) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET missing in .env.local",
    );
  }

  // Create FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "mytube_uploads"); // Must be created in Cloudinary dashboard
  formData.append("folder", folder);
  formData.append("resource_type", resourceType);

  try {
    // Determine API endpoint based on resource type
    const endpoint =
      resourceType === "video"
        ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
        : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Make request with progress tracking
    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 600000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress?.(percentCompleted);
        }
      },
    });

    return response.data as CloudinaryResponse;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Failed to upload file to Cloudinary";
    console.error("Cloudinary upload error:", errorMessage);
    throw new Error(errorMessage);
  }
}

export function getVideoDuration(cloudinaryUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous"; // Handle CORS if needed

      const timeout = setTimeout(() => {
        video.remove();
        resolve(0); 
      }, 30000);

      video.onloadedmetadata = () => {
         clearTimeout(timeout);
         const duration = Math.round(video.duration);
         video.remove();
         resolve(duration);
      };

      video.onerror = () => {
        video.remove();
        reject(new Error("Failed to load video metadata"));
      };

      video.src = cloudinaryUrl;
video.load();
    } catch (error) {
      reject(error);
    }
  });
}

export function getFileSizeMB(file: File): number {
  return Math.round((file.size / 1024 / 1024) * 100) / 100;
}

export function validateVideoFile(
  file: File,
  maxSizeMB: number = 5000,
): string | null {
  // Check file type
  if (!file.type.startsWith("video/")) {
    return "Please select a video file (MP4, WebM, etc.)";
  }

  // Check file size
  const sizeMB = getFileSizeMB(file);
  if (sizeMB > maxSizeMB) {
    return `File size (${sizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`;
  }

  return null;
}

export function validateImageFile(
  file: File,
  maxSizeMB: number = 50,
): string | null {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return "Please select an image file (JPG, PNG, etc.)";
  }

  // Check file size
  const sizeMB = getFileSizeMB(file);
  if (sizeMB > maxSizeMB) {
    return `File size (${sizeMB}MB) exceeds maximum allowed (${maxSizeMB}MB)`;
  }

  return null;
}