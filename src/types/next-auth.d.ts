import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    agentId?: string;
    agentRole?: string;
    dealership?: string;
    error?: "RefreshError";
    user: DefaultSession["user"] & {
      id?: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendAccessToken?: string;
    backendRefreshToken?: string;
    accessTokenExpires?: number;
    agentId?: string;
    agentRole?: string;
    dealership?: string;
    error?: "RefreshError";
  }
}

export {};
