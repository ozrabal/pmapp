import z from "zod";

export const getSessionSchema = z.object({
  id: z.uuid(),
});

export const deleteSessionSchema = getSessionSchema;

export const messageSchema = z
  .object({
    sessionId: z.uuid(),
    message: z.string().max(1500),
  })
  .strict();
