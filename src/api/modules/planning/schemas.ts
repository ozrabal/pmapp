import z from "zod";

// export const startSessionSchema = z
//   .object({
//     userId: z.uuid(),
//   })
//   .strict();

export const messageSchema = z
  .object({
    sessionId: z.uuid(),
    message: z.string().max(1500),
  })
  .strict();
