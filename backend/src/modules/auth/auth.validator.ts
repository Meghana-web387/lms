import { z } from "zod";

export const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(200),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
