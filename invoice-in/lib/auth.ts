// Import NextAuth related libraries
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

// Extend the session type to include user ID
declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// NextAuth configuration options
export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        // Check if credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Check if user exists and has password
          if (!user || !user.password) {
            console.log("User not found or has no password");
            return null;
          }

          // Check if password is correct
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // Return user if password is correct
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          }

          // Return null if password is incorrect
          console.log("Password doesn't match");
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // JWT callback to add user ID to token
    async jwt({ token, user }: any) {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
    // Session callback to add user ID to session
    async session({ session, token }: any) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },
  debug: process.env.NODE_ENV === "development",
}; 