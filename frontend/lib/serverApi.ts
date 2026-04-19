import { headers } from "next/headers";

/** Absolute API base for Server Components (fetch needs a full URL on the server). */
export async function getServerApiBase(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return `${fromEnv.replace(/\/$/, "")}/api`;
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/api`;
}
