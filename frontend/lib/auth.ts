import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, authenticators, sessions, users, verificationTokens, wallets } from "@disputr/db";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { SiweMessage } from "siwe";
import { z } from "zod";
import { getDb } from "@/lib/server/db";

const siweCredentialsSchema = z.object({
  message: z.string(),
  signature: z.string()
});

const db = process.env.DATABASE_URL ? getDb() : null;

function shortWallet(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function parseSiweMessage(message: string) {
  try {
    return new SiweMessage(JSON.parse(message) as ConstructorParameters<typeof SiweMessage>[0]);
  } catch {
    return new SiweMessage(message);
  }
}

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

      if (!db) {
        return null;
      }

      const message = parseSiweMessage(parsed.data.message);
      const url = new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000");
      const result = await message.verify({
        signature: parsed.data.signature,
        domain: url.host
      });

      if (!result.success) {
        return null;
      }

      const address = message.address.toLowerCase();
      const existingWallet = await db.select().from(wallets).where(eq(wallets.address, address)).limit(1);

      let userId = existingWallet[0]?.userId;

      if (!userId) {
        const existingUser = await db.select().from(users).where(eq(users.walletAddress, address)).limit(1);
        userId = existingUser[0]?.id;
      }

      if (!userId) {
        const [createdUser] = await db
          .insert(users)
          .values({
            name: `Wallet ${shortWallet(address)}`,
            walletAddress: address,
            authProvider: "wallet"
          })
          .returning();

        if (!createdUser) {
          return null;
        }

        userId = createdUser.id;
      }

      await db
        .insert(wallets)
        .values({
          userId,
          address,
          chain: "genlayer",
          isPrimary: true
        })
        .onConflictDoNothing();

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name ?? `Wallet ${shortWallet(address)}`,
        email: user.email,
        image: user.image,
        walletAddress: address
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
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
        authenticatorsTable: authenticators
      })
    : undefined,
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (user && "walletAddress" in user) {
        token.walletAddress = user.walletAddress;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        } else if (typeof token.sub === "string") {
          session.user.id = token.sub;
        }
        session.user.walletAddress = typeof token.walletAddress === "string" ? token.walletAddress : undefined;

        if (db && session.user.id && !session.user.walletAddress) {
          const [primaryWallet] = await db.select().from(wallets).where(eq(wallets.userId, session.user.id)).limit(1);
          session.user.walletAddress = primaryWallet?.address;
        }
      }

      return session;
    }
  },
  pages: {
    signIn: "/sign-in"
  }
} satisfies NextAuthConfig);
