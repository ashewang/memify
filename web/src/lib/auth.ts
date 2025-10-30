import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";

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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
      }
      return session;
    },
  },
  trustHost: true,
};

export function auth() {
  return getServerSession(authOptions);
}
