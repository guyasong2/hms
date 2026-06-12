import { z } from 'zod';

export const createDoctorSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    specialty: z.string().min(1).max(100),
    bio: z.string().max(1000).optional(),
    yearsExp: z.number().int().min(0).max(60).optional(),
    fee: z.number().positive(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const addSlotsSchema = z.object({
  body: z.object({
    slots: z.array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
      }),
    ).min(1),
  }),
  params: z.object({ id: z.string() }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type AddSlotsInput = z.infer<typeof addSlotsSchema>['body'];
