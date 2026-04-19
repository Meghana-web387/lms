"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { fetchSubjectTree } from "@/lib/subjects";
import { SubjectSidebar } from "@/components/Sidebar/SubjectSidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { Spinner } from "@/components/common/Spinner";
import { Alert } from "@/components/common/Alert";

export function SubjectShell({ subjectId, children }: { subjectId: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const videoMatch = pathname?.match(/\/subjects\/[^/]+\/video\/([^/]+)/);
  const currentVideoId = videoMatch?.[1];
  const tree = useSidebarStore((s) => s.tree);
  const loading = useSidebarStore((s) => s.loading);
  const error = useSidebarStore((s) => s.error);
  const setTree = useSidebarStore((s) => s.setTree);
  const setLoading = useSidebarStore((s) => s.setLoading);
  const setError = useSidebarStore((s) => s.setError);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubjectTree(subjectId);
        if (!cancelled) setTree(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load subject";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [subjectId, setError, setLoading, setTree]);

  return (
    <div className="flex min-h-[60vh] flex-col gap-6 md:flex-row">
      {loading && (
        <div className="flex w-full items-center justify-center py-12 md:w-64">
          <Spinner />
        </div>
      )}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}
      {!loading && !error && tree && (
        <SubjectSidebar tree={tree} subjectId={subjectId} currentVideoId={currentVideoId} />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
