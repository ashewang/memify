import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { MemeGenerator } from "./meme-generator";

export default async function WorkspacePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Workspace
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your meme lab
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base">
            Paste a snippet or drop an idea below. We&apos;ll analyze the humor
            and draft the first meme concept for you to remix.
          </p>
        </header>

        <MemeGenerator userId={session.user?.id ?? ""} />
      </section>
    </main>
  );
}

