import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { SiweMessage } from "siwe";
import { z } from "zod";

const siweCredentialsSchema = z.object({
  message: z.string(),
  signature: z.string()
});

const providers: Provider[] = [
  Credentials({
    id: "siwe",
    name: "Wallet",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" }
    },
    async authorize(credentials) {
      const parsed = siweCredentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const message = new SiweMessage(parsed.data.message);
      const url = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
      const result = await message.verify({
        signature: parsed.data.signature,
        domain: url.host
      });

      if (!result.success) {
        return null;
      }

      return {
        id: message.address,
        name: message.address,
        walletAddress: message.address
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user && "walletAddress" in user) {
        token.walletAddress = user.walletAddress;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.walletAddress = typeof token.walletAddress === "string" ? token.walletAddress : undefined;
      }

      return session;
    }
  },
  pages: {
    signIn: "/sign-in"
  }
});
