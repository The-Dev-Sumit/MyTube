import { NextAuthOptions }  from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { connectDB } from "./db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        await connectDB();

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Invalid credentials");
        }

        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("User not found");
          }
          
          if (!user.password) {
            throw new Error("try google login from this email");
          }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "google") {
        await connectDB();
        const dbUser = await User.findOneAndUpdate(
          { email: token.email },
          {
            $setOnInsert: {
              // ✅ inserting not updating
              email: token.email,
              name: token.name,
              image: token.picture,
              provider: "google",
            },
          },
          {
            upsert: true, // create only when not found
            new: true,
          },
        );

        token.id = dbUser._id.toString();
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthOptions;
