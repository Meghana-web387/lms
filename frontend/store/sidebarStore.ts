import { create } from "zustand";

export type TreeVideo = {
  id: string;
  title: string;
  order_index: number;
  is_completed: boolean;
  locked: boolean;
};

export type TreeSection = {
  id: string;
  title: string;
  order_index: number;
  videos: TreeVideo[];
};

export type SubjectTree = {
  id: string;
  title: string;
  sections: TreeSection[];
};

type SidebarState = {
  tree: SubjectTree | null;
  loading: boolean;
  error: string | null;
  setTree: (t: SubjectTree | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  markVideoCompleted: (videoId: string) => void;
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  tree: null,
  loading: false,
  error: null,
  setTree: (tree) => set({ tree }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  markVideoCompleted: (videoId) => {
    const t = get().tree;
    if (!t) return;
    const sections = t.sections.map((s) => ({
      ...s,
      videos: s.videos.map((v) =>
        v.id === videoId ? { ...v, is_completed: true, locked: v.locked } : v
      ),
    }));
    set({ tree: { ...t, sections } });
  },
}));
