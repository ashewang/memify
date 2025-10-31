import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      provider?: string | null;
      providerAccountId?: string | null;
    } & DefaultSession["user"];
  }
}
