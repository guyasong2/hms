import { supabase } from '../utils/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [patients, doctors, appointments, revenueRes, recentAppointments] = await Promise.all([
    supabase.from('Patient').select('id', { count: 'exact', head: true }),
    supabase.from('Doctor').select('id', { count: 'exact', head: true }),
    supabase.from('Appointment').select('id', { count: 'exact', head: true }),
    supabase.from('Payment').select('amount').eq('status', 'SUCCEEDED'),
    supabase.from('Appointment')
      .select(`
        *,
        patient:Patient(firstName, lastName),
        doctor:Doctor(firstName, lastName, specialty),
        slot:TimeSlot(*),
        payment:Payment(status, provider, amount)
      `)
      .order('createdAt', { ascending: false })
      .limit(10)
  ]);

  const totalRevenue = (revenueRes.data || []).reduce((sum, p) => sum + p.amount, 0);

  const formattedRecent = (recentAppointments.data || []).map((appt: any) => {
    if (appt.patient && Array.isArray(appt.patient)) appt.patient = appt.patient[0];
    if (appt.doctor && Array.isArray(appt.doctor)) appt.doctor = appt.doctor[0];
    if (appt.slot && Array.isArray(appt.slot)) appt.slot = appt.slot[0];
    if (appt.payment && Array.isArray(appt.payment)) appt.payment = appt.payment[0];
    return appt;
  });

  res.status(200).json({
    success: true,
    data: {
      totalPatients: patients.count || 0,
      totalDoctors: doctors.count || 0,
      totalAppointments: appointments.count || 0,
      totalRevenue,
      recentAppointments: formattedRecent,
    },
  });
});

export const listAllAppointments = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { data: appointments } = await supabase.from('Appointment')
    .select(`
      *,
      patient:Patient(firstName, lastName),
      doctor:Doctor(firstName, lastName, specialty),
      slot:TimeSlot(*),
      payment:Payment(status, provider, amount)
    `)
    .order('createdAt', { ascending: false });

  const formatted = (appointments || []).map((appt: any) => {
    if (appt.patient && Array.isArray(appt.patient)) appt.patient = appt.patient[0];
    if (appt.doctor && Array.isArray(appt.doctor)) appt.doctor = appt.doctor[0];
    if (appt.slot && Array.isArray(appt.slot)) appt.slot = appt.slot[0];
    if (appt.payment && Array.isArray(appt.payment)) appt.payment = appt.payment[0];
    return appt;
  });

  res.status(200).json({ success: true, data: formatted });
});

export const listAllPatients = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { data: patients } = await supabase.from('Patient')
    .select(`*, user:User(email, isActive, createdAt)`)
    .order('createdAt', { ascending: false });

  const formatted = (patients || []).map((p: any) => {
    if (p.user && Array.isArray(p.user)) p.user = p.user[0];
    return p;
  });

  res.status(200).json({ success: true, data: formatted });
});

export const listAllDoctors = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const { data: doctors } = await supabase.from('Doctor')
    .select(`*, user:User(email, isActive, createdAt)`)
    .order('createdAt', { ascending: false });

  const formatted = (doctors || []).map((d: any) => {
    if (d.user && Array.isArray(d.user)) d.user = d.user[0];
    return d;
  });

  res.status(200).json({ success: true, data: formatted });
});

export const toggleDoctorAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data: doctor } = await supabase.from('Doctor').select('*').eq('id', req.params.id).maybeSingle();
  if (!doctor) { res.status(404).json({ success: false, message: 'Doctor not found' }); return; }
  
  const { data: updated } = await supabase.from('Doctor').update({ isAvailable: !doctor.isAvailable }).eq('id', req.params.id).select().single();
  res.status(200).json({ success: true, data: updated });
});

export const verifyDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data: doctor } = await supabase.from('Doctor').select('*').eq('id', req.params.id).maybeSingle();
  if (!doctor) { res.status(404).json({ success: false, message: 'Doctor not found' }); return; }
  
  const { data: updated } = await supabase.from('Doctor').update({ isVerified: true }).eq('id', req.params.id).select().single();
  res.status(200).json({ success: true, data: updated });
});

export const completeAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data: appt } = await supabase.from('Appointment').update({ status: 'COMPLETED' }).eq('id', req.params.id).select().single();
  res.status(200).json({ success: true, data: appt });
});
