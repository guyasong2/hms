import { supabase } from '../utils/supabase';
import { AppError } from '../middleware/errorHandler';
import { CreateAppointmentInput } from '../schemas/appointment.schema';

export const createAppointment = async (patientUserId: string, input: CreateAppointmentInput) => {
  const { data: patient } = await supabase.from('Patient').select('id').eq('userId', patientUserId).maybeSingle();
  if (!patient) throw new AppError('Patient profile not found', 404);

  const { data: slot } = await supabase.from('TimeSlot').select('*').eq('id', input.slotId).maybeSingle();
  if (!slot) throw new AppError('Time slot not found', 404);
  if (slot.isBooked) throw new AppError('This slot is already booked', 409);
  if (slot.doctorId !== input.doctorId) throw new AppError('Slot does not belong to this doctor', 400);

  // Mark slot as booked
  await supabase.from('TimeSlot').update({ isBooked: true }).eq('id', input.slotId);

  // Create appointment
  const { data: appointment, error } = await supabase.from('Appointment').insert({
    patientId: patient.id,
    doctorId: input.doctorId,
    slotId: input.slotId,
    notes: input.notes || null,
    status: 'PENDING_PAYMENT',
  }).select(`
    *,
    doctor:Doctor(firstName, lastName, specialty, fee),
    slot:TimeSlot(*)
  `).single();

  if (error || !appointment) {
    // rollback slot if appt fails
    await supabase.from('TimeSlot').update({ isBooked: false }).eq('id', input.slotId);
    throw new AppError('Failed to create appointment', 500);
  }

  // Handle nested arrays returned by supabase joins
  if (appointment.doctor && Array.isArray(appointment.doctor)) appointment.doctor = appointment.doctor[0];
  if (appointment.slot && Array.isArray(appointment.slot)) appointment.slot = appointment.slot[0];

  return appointment;
};

export const listMyAppointments = async (userId: string, role: string) => {
  if (role === 'DOCTOR') {
    const { data: doctor } = await supabase.from('Doctor').select('id').eq('userId', userId).maybeSingle();
    if (!doctor) throw new AppError('Doctor not found', 404);

    const { data: appointments, error } = await supabase.from('Appointment')
      .select(`
        *,
        patient:Patient(firstName, lastName, gender, avatarUrl),
        slot:TimeSlot(*),
        payment:Payment(status, provider, amount)
      `)
      .eq('doctorId', doctor.id)
      .order('createdAt', { ascending: false });

    if (error) return [];

    return appointments.map((appt: any) => {
      if (appt.patient && Array.isArray(appt.patient)) appt.patient = appt.patient[0];
      if (appt.slot && Array.isArray(appt.slot)) appt.slot = appt.slot[0];
      if (appt.payment && Array.isArray(appt.payment)) appt.payment = appt.payment[0];
      return appt;
    });
  } else {
    const { data: patient } = await supabase.from('Patient').select('id').eq('userId', userId).maybeSingle();
    if (!patient) throw new AppError('Patient not found', 404);

    const { data: appointments, error } = await supabase.from('Appointment')
      .select(`
        *,
        doctor:Doctor(firstName, lastName, specialty, avatarUrl),
        slot:TimeSlot(*),
        payment:Payment(status, provider, amount)
      `)
      .eq('patientId', patient.id)
      .order('createdAt', { ascending: false });

    if (error) return [];

    return appointments.map((appt: any) => {
      if (appt.doctor && Array.isArray(appt.doctor)) appt.doctor = appt.doctor[0];
      if (appt.slot && Array.isArray(appt.slot)) appt.slot = appt.slot[0];
      if (appt.payment && Array.isArray(appt.payment)) appt.payment = appt.payment[0];
      return appt;
    });
  }
};

export const cancelAppointment = async (appointmentId: string, userId: string, role: string) => {
  const { data: appointment } = await supabase.from('Appointment')
    .select(`*, patient:Patient(userId)`)
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) throw new AppError('Appointment not found', 404);

  let pUserId = appointment.patient?.userId;
  if (Array.isArray(appointment.patient)) pUserId = appointment.patient[0]?.userId;

  // Patients can only cancel their own appointments
  if (role === 'PATIENT' && pUserId !== userId) {
    throw new AppError('Forbidden', 403);
  }
  if (appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED') {
    throw new AppError('Cannot cancel a confirmed or completed appointment', 400);
  }

  await supabase.from('Appointment').update({ status: 'CANCELLED' }).eq('id', appointmentId);
  await supabase.from('TimeSlot').update({ isBooked: false }).eq('id', appointment.slotId);

  return { message: 'Appointment cancelled' };
};

export const getAppointmentById = async (appointmentId: string, userId: string, role: string) => {
  const { data: appointment, error } = await supabase.from('Appointment')
    .select(`
      *,
      doctor:Doctor(firstName, lastName, specialty, avatarUrl, fee),
      patient:Patient(userId, user:User(email)),
      slot:TimeSlot(*),
      payment:Payment(*)
    `)
    .eq('id', appointmentId)
    .maybeSingle();

  if (error || !appointment) throw new AppError('Appointment not found', 404);

  if (appointment.doctor && Array.isArray(appointment.doctor)) appointment.doctor = appointment.doctor[0];
  if (appointment.patient && Array.isArray(appointment.patient)) appointment.patient = appointment.patient[0];
  if (appointment.patient?.user && Array.isArray(appointment.patient.user)) appointment.patient.user = appointment.patient.user[0];
  if (appointment.slot && Array.isArray(appointment.slot)) appointment.slot = appointment.slot[0];
  if (appointment.payment && Array.isArray(appointment.payment)) appointment.payment = appointment.payment[0];

  // Access control
  if (role === 'PATIENT' && appointment.patient?.userId !== userId) throw new AppError('Forbidden', 403);

  return appointment;
};
