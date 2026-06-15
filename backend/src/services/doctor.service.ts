import { supabase } from '../utils/supabase';
import { hashPassword } from '../utils/hash';
import { AppError } from '../middleware/errorHandler';
import { CreateDoctorInput, AddSlotsInput } from '../schemas/doctor.schema';

export const listDoctors = async (specialty?: string) => {
  let query = supabase
    .from('Doctor')
    .select(`
      id, firstName, lastName, specialty, bio, yearsExp, fee, avatarUrl, isAvailable,
      user:User!inner(isActive)
    `)
    .eq('isAvailable', true)
    .eq('isVerified', true);

  if (specialty) {
    query = query.ilike('specialty', `%${specialty}%`);
  }

  const { data: doctors, error } = await query;
  if (error) throw new AppError('Failed to fetch doctors', 500);

  // Filter out doctors whose user accounts are inactive
  const activeDoctors = doctors.filter((doc: any) => doc.user.isActive);

  // Return formatted array without the user object
  return activeDoctors.map((doc: any) => {
    const { user, ...rest } = doc;
    return rest;
  });
};

export const getDoctorById = async (id: string) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: doctor, error: docError } = await supabase
    .from('Doctor')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (docError || !doctor) throw new AppError('Doctor not found', 404);

  const { data: timeSlots, error: slotsError } = await supabase
    .from('TimeSlot')
    .select('*')
    .eq('doctorId', id)
    .eq('isBooked', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('startTime', { ascending: true });

  if (!slotsError && timeSlots) {
    doctor.timeSlots = timeSlots;
  } else {
    doctor.timeSlots = [];
  }

  return doctor;
};

export const createDoctor = async (input: CreateDoctorInput) => {
  const { data: existing } = await supabase.from('User').select('id').eq('email', input.email).maybeSingle();
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await hashPassword(input.password);

  const { data: user, error: userError } = await supabase.from('User').insert({
    email: input.email,
    passwordHash,
    role: 'DOCTOR'
  }).select().single();

  if (userError || !user) throw new AppError('Failed to create user', 500);

  const { data: doctor, error: docError } = await supabase.from('Doctor').insert({
    userId: user.id,
    firstName: input.firstName,
    lastName: input.lastName,
    specialty: input.specialty,
    bio: input.bio || null,
    yearsExp: input.yearsExp || 0,
    fee: input.fee,
    avatarUrl: input.avatarUrl || null,
    isVerified: true // manually created by admin
  }).select().single();

  if (docError) throw new AppError('Failed to create doctor profile', 500);

  const { passwordHash: _ph, ...safe } = user;
  safe.doctor = doctor;
  return safe;
};

export const addTimeSlots = async (doctorId: string, input: AddSlotsInput) => {
  const { data: doctor } = await supabase.from('Doctor').select('id').eq('id', doctorId).maybeSingle();
  if (!doctor) throw new AppError('Doctor not found', 404);

  const data = input.slots.map((slot) => ({
    doctorId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));

  const { data: created, error } = await supabase.from('TimeSlot').insert(data).select();
  if (error) throw new AppError('Failed to add time slots', 500);

  return created;
};

export const getDoctorStats = async (doctorId: string) => {
  // We can run these in parallel
  const [totalRes, confirmedRes, pendingRes, revenueRes] = await Promise.all([
    supabase.from('Appointment').select('id', { count: 'exact', head: true }).eq('doctorId', doctorId),
    supabase.from('Appointment').select('id', { count: 'exact', head: true }).eq('doctorId', doctorId).eq('status', 'CONFIRMED'),
    supabase.from('Appointment').select('id', { count: 'exact', head: true }).eq('doctorId', doctorId).eq('status', 'PENDING_PAYMENT'),
    supabase.rpc('get_doctor_revenue', { doc_id: doctorId }) // Or fetch all SUCCEEDED payments and sum them in JS
  ]);

  let revenue = 0;
  if (!revenueRes.error) {
    revenue = revenueRes.data || 0;
  } else {
    // Fallback: sum in JS if RPC isn't created
    const { data: payments } = await supabase
      .from('Payment')
      .select('amount, appointmentId')
      .eq('status', 'SUCCEEDED');

    if (payments) {
      const { data: appointments } = await supabase.from('Appointment').select('id').eq('doctorId', doctorId);
      const apptIds = new Set((appointments || []).map(a => a.id));
      revenue = payments.filter(p => apptIds.has(p.appointmentId)).reduce((sum, p) => sum + p.amount, 0);
    }
  }

  return {
    total: totalRes.count || 0,
    confirmed: confirmedRes.count || 0,
    pending: pendingRes.count || 0,
    revenue
  };
};

export const deleteTimeSlot = async (doctorId: string, slotId: string) => {
  const { data: slot, error: fetchError } = await supabase
    .from('TimeSlot')
    .select('*')
    .eq('id', slotId)
    .eq('doctorId', doctorId)
    .maybeSingle();

  if (fetchError || !slot) throw new AppError('Time slot not found or unauthorized', 404);
  if (slot.isBooked) throw new AppError('Cannot delete a booked time slot', 400);

  const { error: deleteError } = await supabase
    .from('TimeSlot')
    .delete()
    .eq('id', slotId);

  if (deleteError) throw new AppError('Failed to delete time slot', 500);
  return { message: 'Time slot deleted successfully' };
};
