import type { Prisma } from "@prisma/client";

export type VideoNode = {
  id: bigint;
  sectionId: bigint;
  orderIndex: number;
};

export type SectionWithVideos = {
  id: bigint;
  orderIndex: number;
  videos: VideoNode[];
};

/** Flatten sections (ordered) then videos within each (ordered) → global playback order. */
export function flattenVideoOrder(sections: SectionWithVideos[]): bigint[] {
  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);
  const order: bigint[] = [];
  for (const s of sortedSections) {
    const vids = [...s.videos].sort((a, b) => a.orderIndex - b.orderIndex);
    for (const v of vids) order.push(v.id);
  }
  return order;
}

export function getPrevNext(videoId: bigint, globalOrder: bigint[]): {
  previousVideoId: bigint | null;
  nextVideoId: bigint | null;
} {
  const idx = globalOrder.indexOf(videoId);
  if (idx === -1) {
    return { previousVideoId: null, nextVideoId: null };
  }
  return {
    previousVideoId: idx > 0 ? globalOrder[idx - 1]! : null,
    nextVideoId: idx < globalOrder.length - 1 ? globalOrder[idx + 1]! : null,
  };
}

export function getPrerequisiteVideoId(
  videoId: bigint,
  globalOrder: bigint[]
): bigint | null {
  const idx = globalOrder.indexOf(videoId);
  if (idx <= 0) return null;
  return globalOrder[idx - 1]!;
}

export function isVideoUnlocked(
  videoId: bigint,
  globalOrder: bigint[],
  completedVideoIds: Set<string>
): { locked: boolean; unlockReason?: string; prerequisiteVideoId: bigint | null } {
  const prereq = getPrerequisiteVideoId(videoId, globalOrder);
  if (prereq === null) {
    return { locked: false, prerequisiteVideoId: null };
  }
  if (completedVideoIds.has(String(prereq))) {
    return { locked: false, prerequisiteVideoId: prereq };
  }
  return {
    locked: true,
    unlockReason: "Complete previous video",
    prerequisiteVideoId: prereq,
  };
}

/** Map Prisma subject tree to SectionWithVideos for ordering helpers. */
export function sectionsForOrdering(
  sections: Array<Prisma.SectionGetPayload<{ include: { videos: true } }>>
): SectionWithVideos[] {
  return sections.map((s) => ({
    id: s.id,
    orderIndex: s.orderIndex,
    videos: s.videos.map((v) => ({
      id: v.id,
      sectionId: v.sectionId,
      orderIndex: v.orderIndex,
    })),
  }));
}
