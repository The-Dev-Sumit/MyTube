"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, User, LogOut, Cog } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as any);
    }
  }, [session, setUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setUser(null);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between py-2 px-3 max-w-full mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2  transition">
          <Image
            src="https://res.cloudinary.com/dmmzqpfgg/image/upload/v1777094241/My_Tube_logo_kjxfpb.png"
            alt="Logo"
            width={32}
            height={32}
          />
          <span className="font-bold text-lg hidden sm:inline">MyTube</span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-96 mx-4 hidden sm:flex">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-r-full cursor-pointer bg-gray-100 dark:bg-zinc-800 border border-l-0 border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Auth & Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Search */}
          <button
            onClick={() => router.push("/?search=")}
            className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
            <Search size={20} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 cursor-pointer py-2 rounded-full transition">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
              ) : (
                <User size={20} />
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden z-50">
                {session ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
                      <p className="font-semibold text-sm">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Check if admin */}
                    {session.user?.email ===
                      process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-sm"
                        onClick={() => setIsMenuOpen(false)}>
                        <Cog size={16} />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-sm text-red-600 border-t border-gray-200 dark:border-zinc-800">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-sm"
                      onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-sm border-t border-gray-200 dark:border-zinc-800"
                      onClick={() => setIsMenuOpen(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
