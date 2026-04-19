import { prisma } from "../../config/db.js";

export async function findVideoWithContext(videoId: bigint) {
  return prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: {
          subject: true,
        },
      },
    },
  });
}
