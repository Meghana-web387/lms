"use client";

import { useCallback, useEffect, useRef } from "react";
import YouTube, { type YouTubeEvent } from "react-youtube";

const TICK_MS = 5000;

/** YouTube iframe API player instance (subset). */
type YtPlayer = {
  getCurrentTime: () => number;
};

type Props = {
  videoId: string;
  startPositionSeconds: number;
  onProgress: (seconds: number) => void;
  onCompleted: () => void;
};

export function VideoPlayer({ videoId, startPositionSeconds, onProgress, onCompleted }: Props) {
  const playerRef = useRef<YtPlayer | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.();
      if (typeof t === "number") onProgress(t);
    }, TICK_MS);
  }, [onProgress, stopTick]);

  const handleReady = useCallback((e: YouTubeEvent) => {
    playerRef.current = e.target as unknown as YtPlayer;
  }, []);

  const handleStateChange = useCallback(
    (e: YouTubeEvent) => {
      const state = e.data as number;
      // 1 playing, 2 paused, 0 ended
      if (state === 1) {
        startTick();
        return;
      }
      stopTick();
      if (state === 2 && playerRef.current) {
        try {
          onProgress(playerRef.current.getCurrentTime());
        } catch {
          /* ignore */
        }
      }
      if (state === 0) {
        try {
          onProgress(playerRef.current?.getCurrentTime?.() ?? 0);
        } catch {
          /* ignore */
        }
        onCompleted();
      }
    },
    [onCompleted, onProgress, startTick, stopTick]
  );

  useEffect(() => {
    return () => {
      stopTick();
      try {
        if (playerRef.current) onProgress(playerRef.current.getCurrentTime());
      } catch {
        /* ignore */
      }
    };
  }, [onProgress, stopTick]);

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-lg border border-neutral-200 bg-black pt-[56.25%] shadow-sm">
      <div className="absolute inset-0">
        <YouTube
          key={videoId}
          videoId={videoId}
          className="absolute left-0 top-0 h-full w-full"
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              start: Math.max(0, Math.floor(startPositionSeconds)),
              rel: 0,
              modestbranding: 1,
            },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
          iframeClassName="absolute left-0 top-0 h-full w-full"
        />
      </div>
    </div>
  );
}
