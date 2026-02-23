import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions, getServerSession as nextAuthGetServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isAccountLocked,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/lib/account-lockout";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.toLowerCase();

        if (isAccountLocked(email)) {
          throw new Error("Invalid email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          recordFailedAttempt(email);
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          recordFailedAttempt(email);
          throw new Error("Invalid email or password");
        }

        clearFailedAttempts(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
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
