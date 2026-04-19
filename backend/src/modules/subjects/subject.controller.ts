import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as subjectRepo from "./subject.repository.js";
import * as subjectService from "./subject.service.js";
import { AppError } from "../../middleware/errorHandler.js";
import { parseBigIntParam } from "../../utils/id.js";

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
});

export async function listSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = listQuery.parse(req.query);
    const { items, total } = await subjectRepo.listPublishedSubjects(q.page, q.pageSize, q.q);
    res.json({
      items: items.map((s) => ({
        id: String(s.id),
        title: s.title,
        slug: s.slug,
        description: s.description,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      })),
      page: q.page,
      pageSize: q.pageSize,
      total,
    });
  } catch (e) {
    next(e);
  }
}

export async function getSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subjectId = parseBigIntParam(req.params.subjectId, "subjectId");
    const meta = await subjectService.getSubjectMeta(subjectId);
    res.json(meta);
  } catch (e) {
    next(e);
  }
}

export async function getSubjectTree(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const subjectId = parseBigIntParam(req.params.subjectId, "subjectId");
    const tree = await subjectService.getSubjectTree(subjectId, user.id);
    res.json(tree);
  } catch (e) {
    next(e);
  }
}

export async function getFirstVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const subjectId = parseBigIntParam(req.params.subjectId, "subjectId");
    const video_id = await subjectService.getFirstUnlockedVideoId(subjectId, user.id);
    res.json({ video_id });
  } catch (e) {
    next(e);
  }
}
