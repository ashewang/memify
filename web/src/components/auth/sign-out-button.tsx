"use client";

import { signOut } from "next-auth/react";
import type { PropsWithChildren } from "react";

type SignOutButtonProps = PropsWithChildren<{
  variant?: "ghost" | "primary";
}>;

export function SignOutButton({
  children,
  variant = "ghost",
}: SignOutButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses =
    variant === "primary"
      ? "bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:outline-neutral-900"
      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 focus-visible:outline-neutral-400";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses}`}
      onClick={() => signOut()}
    >
      {children ?? "Sign out"}
    </button>
  );
}

