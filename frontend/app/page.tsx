import Link from "next/link";
import { getServerApiBase } from "@/lib/serverApi";

type SubjectItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
};

type ListResponse = {
  items: SubjectItem[];
  page: number;
  pageSize: number;
  total: number;
};

async function fetchSubjects(): Promise<ListResponse> {
  const base = await getServerApiBase();
  const res = await fetch(`${base}/subjects?page=1&pageSize=50`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to load subjects");
  }
  return res.json() as Promise<ListResponse>;
}

export default async function HomePage() {
  let data: ListResponse;
  try {
    data = await fetchSubjects();
  } catch {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Could not reach the API. Ensure the backend is running (and Next.js rewrites target it, or set{" "}
          <code className="rounded bg-neutral-100 px-1">NEXT_PUBLIC_API_BASE_URL</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Subjects</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Browse published courses. Sign in to track progress and resume where you left off.
        </p>
      </div>
      <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
        {data.items.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-600">No subjects published yet.</li>
        )}
        {data.items.map((s) => (
          <li key={s.id} className="px-4 py-4 hover:bg-neutral-50">
            <Link href={`/subjects/${s.id}`} className="block">
              <span className="text-lg font-medium text-neutral-900">{s.title}</span>
              {s.description && (
                <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{s.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
