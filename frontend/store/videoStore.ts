import { create } from "zustand";

type VideoState = {
  subjectId: string | null;
  currentVideoId: string | null;
  nextVideoId: string | null;
  prevVideoId: string | null;
  setContext: (ctx: {
    subjectId: string;
    currentVideoId: string;
    nextVideoId: string | null;
    prevVideoId: string | null;
  }) => void;
  clear: () => void;
};

export const useVideoStore = create<VideoState>((set) => ({
  subjectId: null,
  currentVideoId: null,
  nextVideoId: null,
  prevVideoId: null,
  setContext: (ctx) => set(ctx),
  clear: () =>
    set({
      subjectId: null,
      currentVideoId: null,
      nextVideoId: null,
      prevVideoId: null,
    }),
}));
