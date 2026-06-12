import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({ success: true, data: result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(refreshToken ?? '');
  res.status(200).json({ success: true, message: 'Logged out' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.status(200).json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updatedUser = await authService.updateProfile(req.user!.userId, req.user!.role, req.body);
  res.status(200).json({ success: true, data: updatedUser });
});
