import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role: "admin" | "user";
      organizationId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "admin" | "user";
    organizationId: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "user";
    organizationId?: string;
    accessToken?: string;
  }
}