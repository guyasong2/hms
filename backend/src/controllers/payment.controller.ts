import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await paymentService.initiatePayment({
    appointmentId: req.body.appointmentId,
    provider: req.body.provider,
    phone: req.body.phone,
  });
  res.status(200).json({ success: true, data: result });
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await paymentService.verifyPayment(req.params.appointmentId);
  res.status(200).json({ success: true, data: result });
});

export const mtnCallback = asyncHandler(async (req: Request, res: Response) => {
  await paymentService.handleMtnCallback(req.body);
  res.status(200).json({ success: true });
});

export const orangeCallback = asyncHandler(async (req: Request, res: Response) => {
  await paymentService.handleOrangeCallback(req.query as Record<string, string>);
  res.status(200).json({ success: true });
});
