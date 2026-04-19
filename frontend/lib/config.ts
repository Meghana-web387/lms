/**
 * API base path for client and server fetch/axios.
 * - If `NEXT_PUBLIC_API_BASE_URL` is set (e.g. `http://localhost:4000`), calls go directly to the backend.
 * - If unset, use same-origin `/api` (pair with `next.config.mjs` rewrites in development).
 */
export function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) return "/api";
  return `${raw.replace(/\/$/, "")}/api`;
}
