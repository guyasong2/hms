import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { createAppointmentSchema } from '../schemas/appointment.schema';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('PATIENT'), validate(createAppointmentSchema), appointmentController.createAppointment);
router.get('/my', requireRole('PATIENT', 'DOCTOR'), appointmentController.listMyAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

export default router;
