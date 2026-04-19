import { prisma } from "../../config/db.js";
import * as sectionRepo from "../sections/section.repository.js";
import * as videoRepo from "./video.repository.js";
import {
  flattenVideoOrder,
  getPrevNext,
  isVideoUnlocked,
  sectionsForOrdering,
} from "../../utils/ordering.js";
import { extractYoutubeVideoId } from "../../utils/youtube.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function getVideoDetail(videoId: bigint, userId: bigint) {
  const video = await videoRepo.findVideoWithContext(videoId);
  if (!video) throw new AppError(404, "Video not found");
  if (!video.section.subject.isPublished) throw new AppError(404, "Video not found");

  const subjectId = video.section.subjectId;
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

  const { previousVideoId, nextVideoId } = getPrevNext(videoId, globalOrder);
  const lock = isVideoUnlocked(videoId, globalOrder, completed);

  const ytId = extractYoutubeVideoId(video.youtubeUrl);
  if (!ytId) throw new AppError(500, "Invalid YouTube URL for video");

  return {
    id: String(video.id),
    title: video.title,
    description: video.description,
    youtube_url: video.youtubeUrl,
    youtube_video_id: ytId,
    order_index: video.orderIndex,
    duration_seconds: video.durationSeconds,
    section_id: String(video.sectionId),
    section_title: video.section.title,
    subject_id: String(video.section.subjectId),
    subject_title: video.section.subject.title,
    previous_video_id: previousVideoId ? String(previousVideoId) : null,
    next_video_id: nextVideoId ? String(nextVideoId) : null,
    locked: lock.locked,
    unlock_reason: lock.unlockReason ?? null,
  };
}
