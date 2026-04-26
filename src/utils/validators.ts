import { z } from "zod";

export const VideoUploadSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(5000).optional(),
  category: z.enum([
    "tech",
    "gaming",
    "music",
    "education",
    "entertainment",
    "tutorial",
  ]),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

export const CommentSchema = z.object({
  content: z.string().min(1).max(1000),
  videoId: z.string(),
});

export const SignupSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type VideoUploadInput = z.infer<typeof VideoUploadSchema>;
export type CommentInput = z.infer<typeof CommentSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
