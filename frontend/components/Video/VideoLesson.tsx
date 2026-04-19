"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { createDebouncedProgress } from "@/lib/progress";
import { fetchSubjectTree } from "@/lib/subjects";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVideoStore } from "@/store/videoStore";
import { VideoPlayer } from "./VideoPlayer";
import { VideoMeta } from "./VideoMeta";
import { Alert } from "@/components/common/Alert";
import { Spinner } from "@/components/common/Spinner";

export type VideoDetail = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_video_id: string;
  order_index: number;
  duration_seconds: number | null;
  section_id: string;
  section_title: string;
  subject_id: string;
  subject_title: string;
  previous_video_id: string | null;
  next_video_id: string | null;
  locked: boolean;
  unlock_reason: string | null;
};

export function VideoLesson({ subjectId, videoId }: { subjectId: string; videoId: string }) {
  const router = useRouter();
  const setTree = useSidebarStore((s) => s.setTree);
  const setVideoContext = useVideoStore((s) => s.setContext);

  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resumeSeconds, setResumeSeconds] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);

  const debounced = useMemo(
    () =>
      createDebouncedProgress(async (seconds, completed) => {
        await apiClient.post(`/progress/videos/${videoId}`, {
          last_position_seconds: seconds,
          ...(completed !== undefined ? { is_completed: completed } : {}),
        });
      }, 4000),
    [videoId]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadError(null);
      try {
        const { data } = await apiClient.get<VideoDetail>(`/videos/${videoId}`);
        if (cancelled) return;
        setDetail(data);
        setVideoContext({
          subjectId: data.subject_id,
          currentVideoId: data.id,
          nextVideoId: data.next_video_id,
          prevVideoId: data.previous_video_id,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Could not load video";
        if (!cancelled) setLoadError(msg);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [videoId, setVideoContext]);

  useEffect(() => {
    if (!detail || detail.locked) return;
    let cancelled = false;
    async function loadProgress() {
      try {
        const { data } = await apiClient.get<{ last_position_seconds: number; is_completed: boolean }>(
          `/progress/videos/${videoId}`
        );
        if (cancelled) return;
        const start = Math.max(0, data.last_position_seconds - 3);
        setResumeSeconds(start);
      } catch {
        setResumeSeconds(0);
      } finally {
        if (!cancelled) setProgressLoaded(true);
      }
    }
    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, [detail, videoId]);

  const onProgress = useCallback(
    (seconds: number) => {
      debounced.schedule(seconds);
    },
    [debounced]
  );

  const onCompleted = useCallback(async () => {
    await debounced.flush(detail?.duration_seconds ?? 0, true);
    const tree = await fetchSubjectTree(subjectId);
    setTree(tree);
    if (detail?.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${detail.next_video_id}`);
    }
  }, [debounced, detail, router, setTree, subjectId]);

  if (loadError) {
    return <Alert variant="error">{loadError}</Alert>;
  }

  if (!detail) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (detail.locked) {
    return (
      <Alert variant="error">
        {detail.unlock_reason ?? "This lesson is locked. Complete the previous video first."}
      </Alert>
    );
  }

  if (!progressLoaded) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <VideoPlayer
        videoId={detail.youtube_video_id}
        startPositionSeconds={resumeSeconds}
        onProgress={onProgress}
        onCompleted={onCompleted}
      />
      <VideoMeta
        title={detail.title}
        description={detail.description}
        subjectId={detail.subject_id}
        subjectTitle={detail.subject_title}
        sectionTitle={detail.section_title}
        prevId={detail.previous_video_id}
        nextId={detail.next_video_id}
      />
    </div>
  );
}
