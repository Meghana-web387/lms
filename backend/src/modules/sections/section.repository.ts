import { prisma } from "../../config/db.js";

export async function listSectionsForSubject(subjectId: bigint) {
  return prisma.section.findMany({
    where: { subjectId },
    orderBy: { orderIndex: "asc" },
    include: {
      videos: { orderBy: { orderIndex: "asc" } },
    },
  });
}
