import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    role: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must include uppercase, lowercase and number'),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    // Patient fields
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    // Doctor fields
    specialty: z.string().optional(),
    fee: z.number().optional(),
    yearsExp: z.number().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    // Patient specific
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    // Doctor specific
    specialty: z.string().optional(),
    bio: z.string().optional(),
    fee: z.number().optional(),
    yearsExp: z.number().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
