import { z } from "zod";

/**
 * Schema for task creation and editing
 */
export const taskFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nazwa zadania musi mieć co najmniej 3 znaki" })
    .max(100, { message: "Nazwa zadania nie może być dłuższa niż 100 znaków" }),
  description: z.string().max(1000, { message: "Opis nie może być dłuższy niż 1000 znaków" }).nullable().optional(),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Wymagany poziom priorytetu" }),
  }),
  estimatedValue: z.number().min(0, { message: "Estymacja nie może być wartością ujemną" }).nullable().optional(),
});

/**
 * Type for task form data
 */
export type TaskFormValues = z.infer<typeof taskFormSchema>;

/**
 * Default values for task form
 */
export const defaultTaskFormValues: TaskFormValues = {
  name: "",
  description: "",
  priority: "medium",
  estimatedValue: null,
};
