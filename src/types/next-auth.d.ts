import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    agentId?: string;
    agentRole?: string;
    dealership?: string;
    error?: string;
    user: DefaultSession["user"] & {
      id?: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    backendAccessToken?: string;
    backendRefreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    backendAccessToken?: string;
    backendRefreshToken?: string;
    accessTokenExpires?: number;
    agentId?: string;
    agentRole?: string;
    dealership?: string;
    error?: string;
    email?: string | null;
  }
}

export {};
