import { prisma } from "../../config/db.js";

export async function findPublishedSubjectById(id: bigint) {
  return prisma.subject.findFirst({
    where: { id, isPublished: true },
  });
}

export async function listPublishedSubjects(page: number, pageSize: number, q?: string) {
  const where = {
    isPublished: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.subject.count({ where }),
  ]);
  return { items, total };
}
