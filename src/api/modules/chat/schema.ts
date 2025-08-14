import { z } from "zod";

export const startSessionSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const sessionSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export const messageSchema = z
  .object({
    id: z.string().uuid(),
    message: z.string().max(1500),
  })
  .strict();
