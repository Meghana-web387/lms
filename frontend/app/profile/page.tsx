"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { getApiBase } from "@/lib/config";
import Link from "next/link";
import { Spinner } from "@/components/common/Spinner";
import { Alert } from "@/components/common/Alert";

type SubjectItem = { id: string; title: string; description: string | null };
type ListResponse = { items: SubjectItem[] };

type SubjectProgress = {
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
};

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const userName = useAuthStore((s) => s.user?.name);
  const userEmail = useAuthStore((s) => s.user?.email);
  const [subjects, setSubjects] = useState<SubjectItem[] | null>(null);
  const [progressBySubject, setProgressBySubject] = useState<Record<string, SubjectProgress>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const base = getApiBase();
        const listRes = await fetch(`${base}/subjects?page=1&pageSize=50`);
        const listJson = (await listRes.json()) as ListResponse;
        if (cancelled) return;
        setSubjects(listJson.items);

        const entries = await Promise.all(
          listJson.items.map(async (s) => {
            try {
              const { data } = await apiClient.get<SubjectProgress>(`/progress/subjects/${s.id}`);
              return [s.id, data] as const;
            } catch {
              return [s.id, null] as const;
            }
          })
        );
        if (cancelled) return;
        const map: Record<string, SubjectProgress> = {};
        for (const [id, p] of entries) {
          if (p) map[id] = p;
        }
        setProgressBySubject(map);
      } catch {
        if (!cancelled) setError("Could not load progress.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!subjects) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-neutral-600">
          {userName && <span className="font-medium text-neutral-900">{userName}</span>}
          {userEmail && (
            <span className="block text-sm text-neutral-600">
              {userEmail}
            </span>
          )}
        </p>
      </div>
      <div>
        <h2 className="text-lg font-medium text-neutral-900">Progress</h2>
        <ul className="mt-4 divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
          {subjects.map((s) => {
            const p = progressBySubject[s.id];
            return (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <Link href={`/subjects/${s.id}`} className="font-medium text-neutral-900 hover:underline">
                  {s.title}
                </Link>
                {p ? (
                  <span className="text-neutral-600">
                    {p.completed_videos}/{p.total_videos} ({p.percent_complete}%)
                  </span>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
