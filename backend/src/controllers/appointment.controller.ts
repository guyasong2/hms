import { Request, Response } from 'express';
import * as appointmentService from '../services/appointment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.createAppointment(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: appointment });
});

export const listMyAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointments = await appointmentService.listMyAppointments(req.user!.userId, req.user!.role);
  res.status(200).json({ success: true, data: appointments });
});

export const getAppointmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await appointmentService.getAppointmentById(
    req.params.id,
    req.user!.userId,
    req.user!.role,
  );
  res.status(200).json({ success: true, data: appointment });
});

export const cancelAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await appointmentService.cancelAppointment(
    req.params.id,
    req.user!.userId,
    req.user!.role,
  );
  res.status(200).json({ success: true, data: result });
});
