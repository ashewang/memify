"use client";

import { signIn } from "next-auth/react";
import type { PropsWithChildren } from "react";

type SignInButtonProps = PropsWithChildren<{
  provider?: "google";
  variant?: "primary" | "ghost";
}>;

export function SignInButton({
  children,
  provider = "google",
  variant = "primary",
}: SignInButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses =
    variant === "ghost"
      ? "border border-dashed border-neutral-400 text-neutral-700 hover:bg-neutral-100"
      : "bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:outline-neutral-900";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses}`}
      onClick={() => signIn(provider)}
    >
      {children ?? "Continue with Google"}
    </button>
  );
}

