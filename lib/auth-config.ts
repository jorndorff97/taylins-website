import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session for easy access
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

/**
 * Helper to get the server session with authOptions pre-configured.
 * Returns the session or null if not authenticated.
 */
export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

/**
 * Helper to get the current user's ID.
 * Returns the user ID string or null if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.id ?? null;
}
