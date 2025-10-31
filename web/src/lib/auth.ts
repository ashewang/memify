import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
const apiBaseUrl = process.env.API_BASE_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: googleClientId || "GOOGLE_CLIENT_ID_NOT_SET",
      clientSecret: googleClientSecret || "GOOGLE_CLIENT_SECRET_NOT_SET",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const provider = account.provider;
        const providerAccountId = account.providerAccountId;
        if (provider && providerAccountId) {
          token.sub = `${provider}:${providerAccountId}`;
          token.provider = provider;
          token.providerAccountId = providerAccountId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.provider =
          typeof token.provider === "string"
            ? token.provider
            : session.user.provider ?? null;
        session.user.providerAccountId =
          typeof token.providerAccountId === "string"
            ? token.providerAccountId
            : session.user.providerAccountId ?? null;
      }
      return session;
    },
  },
  trustHost: true,
  events: {
    async signIn({ user, account, profile }) {
      console.log("[debuglog] signIn event fired", {
        apiBaseUrl,
        nextAuthSecretDefined: Boolean(nextAuthSecret),
        accountProvider: account?.provider,
        accountProviderAccountId: account?.providerAccountId,
        profileSub: profile && "sub" in profile ? profile.sub : undefined,
      });

      if (!apiBaseUrl || !nextAuthSecret) {
        console.warn(
          "[debuglog] session sync skipped because API_BASE_URL or NEXTAUTH_SECRET is missing",
        );
        return;
      }

      const provider = account?.provider ?? "unknown";
      const providerAccountId =
        account?.providerAccountId ??
        // @ts-expect-error profile shape depends on provider; Google exposes `sub`.
        profile?.sub ??
        user.id ??
        "";

      if (!providerAccountId) {
        console.warn(
          "[debuglog] session sync skipped; missing provider account identifier",
        );
        return;
      }

      const userId = `${provider}:${providerAccountId}`;

      if (provider === "unknown") {
        console.warn(
          "[debuglog] session sync skipped; missing provider name",
        );
        return;
      }

      console.log("[debuglog] syncing user session", {
        userId,
        provider,
        providerAccountId,
        email: user.email,
        name: user.name,
      });

      try {
        const response = await fetch(`${apiBaseUrl}/api/users/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Memify-Session-Secret": nextAuthSecret,
          },
          body: JSON.stringify({
            user_id: userId,
            provider,
            provider_account_id: providerAccountId,
            email: user.email ?? "",
            display_name: user.name ?? "",
            picture_url: user.image ?? "",
          }),
        });

        if (!response.ok) {
          const details = await response.text();
          console.error("[debuglog] session sync failed", {
            status: response.status,
            details,
          });
        } else {
          console.log("[debuglog] session sync success", {
            status: response.status,
          });
        }
      } catch (error) {
        console.error("[debuglog] session sync error", error);
      }
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
