import { Request, Response } from 'express';
import * as doctorService from '../services/doctor.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { specialty } = req.query as { specialty?: string };
  const doctors = await doctorService.listDoctors(specialty);
  res.status(200).json({ success: true, data: doctors });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, data: doctor });
});

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await doctorService.createDoctor(req.body);
  res.status(201).json({ success: true, data: doctor });
});

export const addSlots = asyncHandler(async (req: Request, res: Response) => {
  const result = await doctorService.addTimeSlots(req.params.id, req.body);
  res.status(201).json({ success: true, data: result });
});

export const getDoctorStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Doctor can only fetch their own stats unless admin
  const doctorId = req.params.id;
  const stats = await doctorService.getDoctorStats(doctorId);
  res.status(200).json({ success: true, data: stats });
});

export const deleteSlot = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await doctorService.deleteTimeSlot(req.params.id, req.params.slotId);
  res.status(200).json({ success: true, data: result });
});
