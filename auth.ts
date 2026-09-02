import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { verifyTotp, generateTotpSecret } from "@/lib/totp";
import { prisma } from "@/lib/prisma";

class MFARequiredError extends CredentialsSignin {
  code = "MFA_REQUIRED";
}

class MFAInvalidError extends CredentialsSignin {
  code = "MFA_INVALID";
}

declare module "next-auth" {
  interface User {
    role?: string;
    mfaEnabled?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      mfaEnabled: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  // Required for next start / reverse proxies (Amvera, etc.)
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 60 },
  pages: {
    signIn: "/en/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaCode: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const mfaCode = credentials.mfaCode as string | undefined;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.mfaEnabled && user.mfaSecret) {
          if (!mfaCode) {
            throw new MFARequiredError();
          }
          const mfaResult = await verifyTotp({ token: mfaCode, secret: user.mfaSecret });
          if (!mfaResult.valid) {
            throw new MFAInvalidError();
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mfaEnabled = user.mfaEnabled;
        token.mfaVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CLIENT";
        session.user.mfaEnabled = (token.mfaEnabled as boolean) || false;
      }
      return session;
    },
  },
});
