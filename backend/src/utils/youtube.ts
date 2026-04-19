/** Extract 11-char YouTube video id from common URL shapes. */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && id.length === 11 ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
        const v = u.searchParams.get("v");
        if (v && v.length === 11) return v;
      }
      const embed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1]!;
      const short = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (short) return short[1]!;
    }
  } catch {
    return null;
  }
  return null;
}
