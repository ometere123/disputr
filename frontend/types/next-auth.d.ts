import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    walletAddress?: string;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    walletAddress?: string;
  }
}
