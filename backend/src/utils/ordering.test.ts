import {
  flattenVideoOrder,
  getPrerequisiteVideoId,
  getPrevNext,
  isVideoUnlocked,
  type SectionWithVideos,
} from "./ordering";

function vid(n: number): bigint {
  return BigInt(n);
}

describe("ordering", () => {
  const sections: SectionWithVideos[] = [
    {
      id: vid(1),
      orderIndex: 0,
      videos: [
        { id: vid(10), sectionId: vid(1), orderIndex: 0 },
        { id: vid(11), sectionId: vid(1), orderIndex: 1 },
      ],
    },
    {
      id: vid(2),
      orderIndex: 1,
      videos: [{ id: vid(20), sectionId: vid(2), orderIndex: 0 }],
    },
  ];

  const order = flattenVideoOrder(sections);

  it("flattens section then video order", () => {
    expect(order.map(String)).toEqual(["10", "11", "20"]);
  });

  it("prev/next", () => {
    expect(getPrevNext(vid(10), order)).toEqual({ previousVideoId: null, nextVideoId: vid(11) });
    expect(getPrevNext(vid(11), order)).toEqual({ previousVideoId: vid(10), nextVideoId: vid(20) });
    expect(getPrevNext(vid(20), order)).toEqual({ previousVideoId: vid(11), nextVideoId: null });
  });

  it("prerequisite", () => {
    expect(getPrerequisiteVideoId(vid(10), order)).toBeNull();
    expect(getPrerequisiteVideoId(vid(11), order)).toEqual(vid(10));
    expect(getPrerequisiteVideoId(vid(20), order)).toEqual(vid(11));
  });

  it("locking", () => {
    const none = new Set<string>();
    expect(isVideoUnlocked(vid(10), order, none).locked).toBe(false);
    expect(isVideoUnlocked(vid(11), order, none).locked).toBe(true);

    const firstDone = new Set<string>(["10"]);
    expect(isVideoUnlocked(vid(11), order, firstDone).locked).toBe(false);
    expect(isVideoUnlocked(vid(20), order, firstDone).locked).toBe(true);
  });
});
