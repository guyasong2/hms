import { Router } from 'express';
import * as doctorController from '../controllers/doctor.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createDoctorSchema, addSlotsSchema } from '../schemas/doctor.schema';

const router = Router();

// Public routes
router.get('/', doctorController.listDoctors);
router.get('/:id', doctorController.getDoctorById);

// Admin only
router.post('/', authenticate, requireRole('ADMIN'), validate(createDoctorSchema), doctorController.createDoctor);
router.post('/:id/slots', authenticate, requireRole('ADMIN', 'DOCTOR'), validate(addSlotsSchema), doctorController.addSlots);
router.get('/:id/stats', authenticate, requireRole('ADMIN', 'DOCTOR'), doctorController.getDoctorStats);
router.delete('/:id/slots/:slotId', authenticate, requireRole('ADMIN', 'DOCTOR'), doctorController.deleteSlot);

export default router;
