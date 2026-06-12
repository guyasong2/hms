import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/appointments', adminController.listAllAppointments);
router.get('/patients', adminController.listAllPatients);
router.get('/doctors', adminController.listAllDoctors);
router.patch('/doctors/:id/toggle', adminController.toggleDoctorAvailability);
router.patch('/doctors/:id/verify', adminController.verifyDoctor);
router.patch('/appointments/:id/complete', adminController.completeAppointment);

export default router;
