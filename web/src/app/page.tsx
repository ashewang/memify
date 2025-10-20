import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

const features = [
  {
    title: "Drop Your Context",
    description:
      "Paste text, screenshots, or chat logs. We handle OCR and clean-up automatically.",
  },
  {
    title: "Humor DNA",
    description:
      "Our AI tags the humor style—sarcasm, absurdity, pop culture—and finds matching templates.",
  },
  {
    title: "Instant Meme Drafts",
    description:
      "Review AI-suggested captions, tweak phrasing, and export the final image instantly.",
  },
];

export default async function Home() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-24">
        <header className="flex flex-col gap-6 text-center sm:text-left">
          <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-dashed border-neutral-300 px-4 py-1 text-xs uppercase tracking-[0.2em] text-neutral-500 sm:self-start">
            AI Meme Platform
          </span>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn any moment into a meme within seconds.
            </h1>
            <p className="text-base text-neutral-600 sm:text-lg">
              Memify Studio understands the context, detects the humor style,
              and drafts captions that actually land. Paste a chat snippet or
              screenshot and let the generator do the heavy lifting.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {isAuthenticated ? (
              <>
                <SignOutButton>Sign out</SignOutButton>
                <a
                  href="/workspace"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  Go to workspace
                </a>
              </>
            ) : (
              <>
                <SignInButton>Continue with Google</SignInButton>
                <p className="text-xs text-neutral-500">
                  OAuth required to personalize meme history and preferences.
                </p>
              </>
            )}
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="text-sm text-neutral-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white/70 p-10 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight">
            What&apos;s coming next
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li>• Workspace for drafting memes with live template previews.</li>
            <li>
              • Clipboard-powered screenshot ingestion with automatic OCR.
            </li>
            <li>
              • Humor taxonomy explorer to fine-tune how spicy the meme should
              be.
            </li>
            <li>
              • Collaboration mode for teams to riff and iterate together.
            </li>
          </ul>
          <p className="mt-6 text-xs text-neutral-500">
            You&apos;re viewing the early scaffold of the Memify Studio
            frontend. Backend and AI pipelines are in progress.
          </p>
        </section>
      </section>
    </main>
  );
}
