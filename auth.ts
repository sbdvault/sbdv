import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { verifyTotp } from "@/lib/totp";
import { issueEmailOtp, usesEmailMfa, verifyEmailOtp } from "@/lib/email-otp";
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
    mfaMethod?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      mfaEnabled: boolean;
      mfaMethod?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    mfaEnabled?: boolean;
    mfaMethod?: string | null;
    mfaVerified?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
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

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;
        const mfaCode = credentials.mfaCode as string | undefined;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (user.mfaEnabled) {
          const emailMfa = usesEmailMfa(user);
          if (emailMfa) {
            if (!mfaCode) {
              await issueEmailOtp(user.id, user.email, user.name);
              throw new MFARequiredError();
            }
            const ok = await verifyEmailOtp(user.id, mfaCode);
            if (!ok) throw new MFAInvalidError();
          } else if (user.mfaSecret) {
            if (!mfaCode) throw new MFARequiredError();
            const mfaResult = await verifyTotp({ token: mfaCode, secret: user.mfaSecret });
            if (!mfaResult.valid) throw new MFAInvalidError();
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
          mfaMethod: user.mfaMethod,
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
        token.mfaMethod = user.mfaMethod;
        token.mfaVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CLIENT";
        session.user.mfaEnabled = (token.mfaEnabled as boolean) || false;
        session.user.mfaMethod = (token.mfaMethod as string | null) || null;
      }
      return session;
    },
  },
});
