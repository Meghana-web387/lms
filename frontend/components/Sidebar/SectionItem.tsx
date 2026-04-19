import Link from "next/link";
import type { TreeSection } from "@/store/sidebarStore";

export function SectionItem({
  section,
  subjectId,
  currentVideoId,
}: {
  section: TreeSection;
  subjectId: string;
  currentVideoId?: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {section.title}
      </h3>
      <ul className="space-y-1">
        {section.videos.map((v) => {
          const active = currentVideoId === v.id;
          const content = (
            <span className="flex items-center gap-2">
              <span className="truncate">{v.title}</span>
              {v.locked && <span aria-hidden>🔒</span>}
              {v.is_completed && !v.locked && <span aria-hidden>✓</span>}
            </span>
          );
          if (v.locked) {
            return (
              <li key={v.id}>
                <div
                  className={`rounded px-2 py-1.5 text-sm text-neutral-400 ${active ? "bg-neutral-100" : ""}`}
                  title="Complete the previous video to unlock"
                >
                  {content}
                </div>
              </li>
            );
          }
          return (
            <li key={v.id}>
              <Link
                href={`/subjects/${subjectId}/video/${v.id}`}
                className={`block rounded px-2 py-1.5 text-sm hover:bg-neutral-100 ${
                  active ? "bg-neutral-100 font-medium text-neutral-900" : "text-neutral-700"
                }`}
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
