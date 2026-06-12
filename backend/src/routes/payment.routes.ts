import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { initiatePaymentSchema } from '../schemas/appointment.schema';

const router = Router();

// Protected: patient initiates & verifies
router.post('/initiate', authenticate, requireRole('PATIENT'), validate(initiatePaymentSchema), paymentController.initiatePayment);
router.get('/verify/:appointmentId', authenticate, paymentController.verifyPayment);

// Public callbacks from MoMo providers
router.post('/mtn/callback', paymentController.mtnCallback);
router.get('/orange/callback', paymentController.orangeCallback);

export default router;
