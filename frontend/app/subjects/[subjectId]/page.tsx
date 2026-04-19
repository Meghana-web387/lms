"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { Alert } from "@/components/common/Alert";
import { Spinner } from "@/components/common/Spinner";

export default function SubjectOverviewPage({ params }: { params: { subjectId: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const { data } = await apiClient.get<{ video_id: string | null }>(
          `/subjects/${params.subjectId}/first-video`
        );
        if (cancelled) return;
        if (data.video_id) {
          router.replace(`/subjects/${params.subjectId}/video/${data.video_id}`);
        } else {
          setError("This subject has no videos yet.");
        }
      } catch {
        if (!cancelled) setError("Could not open this subject.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [params.subjectId, router]);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="flex items-center gap-3 text-sm text-neutral-600">
      <Spinner />
      <span>Opening your next lesson…</span>
    </div>
  );
}
