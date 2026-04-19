import Link from "next/link";

export function VideoMeta({
  title,
  description,
  subjectId,
  subjectTitle,
  sectionTitle,
  prevId,
  nextId,
}: {
  title: string;
  description: string | null;
  subjectId: string;
  subjectTitle: string;
  sectionTitle: string;
  prevId: string | null;
  nextId: string | null;
}) {
  return (
    <div className="mt-6 max-w-4xl space-y-4">
      <p className="text-xs text-neutral-500">
        <Link href={`/subjects/${subjectId}`} className="hover:underline">
          {subjectTitle}
        </Link>
        <span className="mx-2">/</span>
        <span>{sectionTitle}</span>
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h1>
      {description && <p className="text-neutral-600 leading-relaxed">{description}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        {prevId ? (
          <Link
            href={`/subjects/${subjectId}/video/${prevId}`}
            className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            ← Previous
          </Link>
        ) : (
          <span className="text-sm text-neutral-400">← Previous</span>
        )}
        {nextId ? (
          <Link
            href={`/subjects/${subjectId}/video/${nextId}`}
            className="text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            Next →
          </Link>
        ) : (
          <span className="text-sm text-neutral-400">Next →</span>
        )}
      </div>
    </div>
  );
}
