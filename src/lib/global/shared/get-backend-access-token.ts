import { auth } from "@/auth";

export async function getBackendAccessToken(): Promise<string | null> {
  const session = await auth();
  const token = session?.backendAccessToken;
  return typeof token === "string" && token.length > 0 ? token : null;
}
