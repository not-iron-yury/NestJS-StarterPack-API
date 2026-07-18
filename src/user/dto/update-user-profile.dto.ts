import { z } from 'zod';

export const UpdateUserProfileSchema = z
  .object({
    firstName: z.string().min(3).max(100).optional(),

    phone: z.string().min(10).max(30).optional(),

    avatarUrl: z.url().optional(),
  })
  .strict() // запрет лишних полей
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Необходимо указать хотя бы одно поле',
  }); // проверка на пустой объект

export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;
