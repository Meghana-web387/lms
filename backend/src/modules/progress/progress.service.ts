import { prisma } from "../../config/db.js";
import * as sectionRepo from "../sections/section.repository.js";
import { flattenVideoOrder, sectionsForOrdering } from "../../utils/ordering.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function getVideoProgress(videoId: bigint, userId: bigint) {
  const row = await prisma.videoProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });
  return {
    last_position_seconds: row?.lastPositionSeconds ?? 0,
    is_completed: row?.isCompleted ?? false,
  };
}

export async function upsertVideoProgress(
  videoId: bigint,
  userId: bigint,
  lastPositionSeconds: number,
  isCompleted?: boolean
) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { section: { include: { subject: true } } },
  });
  if (!video) throw new AppError(404, "Video not found");
  if (!video.section.subject.isPublished) throw new AppError(404, "Video not found");

  let capped = Math.max(0, Math.floor(lastPositionSeconds));
  if (video.durationSeconds != null) {
    capped = Math.min(capped, video.durationSeconds);
  }

  const completed = Boolean(isCompleted);
  const completedAt = completed ? new Date() : null;

  await prisma.videoProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    create: {
      userId,
      videoId,
      lastPositionSeconds: capped,
      isCompleted: completed,
      completedAt: completed ? completedAt : null,
    },
    update: {
      lastPositionSeconds: capped,
      ...(isCompleted !== undefined
        ? {
            isCompleted: completed,
            completedAt: completed ? completedAt : undefined,
          }
        : {}),
    },
  });

  return getVideoProgress(videoId, userId);
}

export async function getSubjectProgress(subjectId: bigint, userId: bigint) {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, isPublished: true },
  });
  if (!subject) throw new AppError(404, "Subject not found");

  const sections = await sectionRepo.listSectionsForSubject(subjectId);
  const globalOrder = flattenVideoOrder(sectionsForOrdering(sections));
  const totalVideos = globalOrder.length;

  const progressRows = await prisma.videoProgress.findMany({
    where: {
      userId,
      videoId: { in: globalOrder },
    },
  });

  const byVideo = new Map(progressRows.map((p) => [String(p.videoId), p]));
  let completedVideos = 0;
  let lastVideoId: string | undefined;
  let lastPositionSeconds: number | undefined;
  let maxUpdated: Date | null = null;

  for (const vid of globalOrder) {
    const p = byVideo.get(String(vid));
    if (p?.isCompleted) completedVideos++;
    if (p && (!maxUpdated || p.updatedAt > maxUpdated)) {
      maxUpdated = p.updatedAt;
      lastVideoId = String(vid);
      lastPositionSeconds = p.lastPositionSeconds;
    }
  }

  const percentComplete =
    totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 10000) / 100;

  return {
    total_videos: totalVideos,
    completed_videos: completedVideos,
    percent_complete: percentComplete,
    last_video_id: lastVideoId ?? null,
    last_position_seconds: lastPositionSeconds ?? null,
  };
}
