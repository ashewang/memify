"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = useMemo(() => {
    if (!user?.name && !user?.email) {
      return "?";
    }

    const source = user.name ?? user.email ?? "";
    const parts = source
      .split(" ")
      .filter(Boolean)
      .map((piece) => piece[0]?.toUpperCase())
      .filter(Boolean);

    if (parts.length === 0) {
      return source[0]?.toUpperCase() ?? "?";
    }

    return parts.slice(0, 2).join("");
  }, [user?.email, user?.name]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-700"
        >
          Memify
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="hidden rounded-full border border-transparent px-4 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-200 hover:bg-neutral-100 md:inline-flex"
          >
            Workspace
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <SignOutButton variant="ghost">Sign out</SignOutButton>
              <Link
                href="/profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition-transform hover:scale-105"
                aria-label="View profile"
              >
                {initials}
              </Link>
            </div>
          ) : (
            <SignInButton variant="primary">Sign in</SignInButton>
          )}
        </nav>
      </div>
    </header>
  );
}
