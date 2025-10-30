import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const user = session.user;
  const hasGeneratedMemes = false;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Profile
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your meme journey
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base">
            Review your account details and track the memes you&apos;ve created
            with Memify.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_1.2fr]">
          <article className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">
              Account
            </h2>
            <dl className="space-y-3 text-sm text-neutral-700">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Name
                </dt>
                <dd>{user?.name ?? "Unknown adventurer"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Email
                </dt>
                <dd>{user?.email ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Member since
                </dt>
                <dd>Google OAuth session</dd>
              </div>
            </dl>
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              Jump back to workspace
            </Link>
          </article>

          <article className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                Meme history
              </h2>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Coming soon
              </span>
            </header>

            {hasGeneratedMemes ? (
              <p className="text-sm text-neutral-600">
                Your recent memes will appear here once the generation history
                service is connected.
              </p>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
                <p>
                  You haven&apos;t saved any meme drafts yet. Generate one in
                  the workspace and they&apos;ll land here for quick access.
                </p>
                <p className="text-xs text-neutral-400">
                  Persistence is on the roadmap—this section will list template
                  choices, captions, and timestamps once storage is wired up.
                </p>
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
