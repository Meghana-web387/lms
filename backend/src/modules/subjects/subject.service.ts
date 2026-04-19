import { prisma } from "../../config/db.js";
import * as subjectRepo from "./subject.repository.js";
import * as sectionRepo from "../sections/section.repository.js";
import { flattenVideoOrder, isVideoUnlocked, sectionsForOrdering } from "../../utils/ordering.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function getSubjectMeta(subjectId: bigint) {
  const subject = await subjectRepo.findPublishedSubjectById(subjectId);
  if (!subject) throw new AppError(404, "Subject not found");
  return {
    id: String(subject.id),
    title: subject.title,
    slug: subject.slug,
    description: subject.description,
    isPublished: subject.isPublished,
  };
}

export async function getSubjectTree(subjectId: bigint, userId: bigint) {
  const subject = await subjectRepo.findPublishedSubjectById(subjectId);
  if (!subject) throw new AppError(404, "Subject not found");

  const sections = await sectionRepo.listSectionsForSubject(subjectId);
  const orderSections = sectionsForOrdering(sections);
  const globalOrder = flattenVideoOrder(orderSections);

  const progressRows = await prisma.videoProgress.findMany({
    where: {
      userId,
      videoId: { in: globalOrder },
      isCompleted: true,
    },
    select: { videoId: true },
  });
  const completed = new Set(progressRows.map((r) => String(r.videoId)));

  return {
    id: String(subject.id),
    title: subject.title,
    sections: sections.map((s) => ({
      id: String(s.id),
      title: s.title,
      order_index: s.orderIndex,
      videos: s.videos.map((v) => {
        const { locked } = isVideoUnlocked(v.id, globalOrder, completed);
        return {
          id: String(v.id),
          title: v.title,
          order_index: v.orderIndex,
          is_completed: completed.has(String(v.id)),
          locked,
        };
      }),
    })),
  };
}

export async function getFirstUnlockedVideoId(subjectId: bigint, userId: bigint): Promise<string | null> {
  const subject = await subjectRepo.findPublishedSubjectById(subjectId);
  if (!subject) throw new AppError(404, "Subject not found");

  const sections = await sectionRepo.listSectionsForSubject(subjectId);
  const globalOrder = flattenVideoOrder(sectionsForOrdering(sections));
  if (globalOrder.length === 0) return null;

  const progressRows = await prisma.videoProgress.findMany({
    where: { userId, videoId: { in: globalOrder }, isCompleted: true },
    select: { videoId: true },
  });
  const completed = new Set(progressRows.map((r) => String(r.videoId)));

  for (const vid of globalOrder) {
    const { locked } = isVideoUnlocked(vid, globalOrder, completed);
    if (!locked) return String(vid);
  }
  return null;
}
