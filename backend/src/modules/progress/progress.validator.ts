import { z } from "zod";

export const upsertProgressBody = z.object({
  last_position_seconds: z.number().min(0),
  is_completed: z.boolean().optional(),
});
