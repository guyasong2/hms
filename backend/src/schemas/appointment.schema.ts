import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string(),
    slotId: z.string(),
    notes: z.string().max(500).optional(),
  }),
});

export const initiatePaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string(),
    provider: z.enum(['MTN', 'ORANGE']),
    phone: z.string().min(9, 'Phone must be at least 9 digits'),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>['body'];
