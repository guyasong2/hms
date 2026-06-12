import { supabase } from '../utils/supabase';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../schemas/auth.schema';

const REFRESH_DAYS = 7;

export const registerUser = async (input: RegisterInput) => {
  const { data: existing } = await supabase.from('User').select('id').eq('email', input.email).maybeSingle();
  if (existing) throw new AppError('Email already in use', 409);

  const passwordHash = await hashPassword(input.password);
  const role = input.role || 'PATIENT';

  const { data: user, error: userError } = await supabase
    .from('User')
    .insert({ email: input.email, passwordHash, role })
    .select()
    .single();

  if (userError || !user) throw new AppError('Failed to create user', 500);

  if (role === 'DOCTOR') {
    if (!input.specialty || !input.fee) throw new AppError('Specialty and fee are required for doctors', 400);
    const { error: docError } = await supabase.from('Doctor').insert({
      userId: user.id,
      firstName: input.firstName,
      lastName: input.lastName,
      specialty: input.specialty,
      fee: input.fee,
      yearsExp: input.yearsExp || 0,
    });
    if (docError) throw new AppError('Failed to create doctor profile', 500);
  } else {
    const { error: patError } = await supabase.from('Patient').insert({
      userId: user.id,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth || null,
      gender: input.gender || null,
    });
    if (patError) throw new AppError('Failed to create patient profile', 500);
  }

  const { data: finalUser } = await supabase
    .from('User')
    .select(`*, patient:Patient(*), doctor:Doctor(*)`)
    .eq('id', user.id)
    .single();

  const { passwordHash: _ph, ...safe } = finalUser || user;
  return safe;
};

export const loginUser = async (input: LoginInput) => {
  const { data: user } = await supabase
    .from('User')
    .select(`*, patient:Patient(*), doctor:Doctor(*)`)
    .eq('email', input.email)
    .maybeSingle();

  if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
  
  await supabase.from('RefreshToken').insert({ 
    userId: user.id, 
    token: refreshToken, 
    expiresAt: expiresAt.toISOString() 
  });

  const { passwordHash: _ph, ...safe } = user;
  return { accessToken, refreshToken, user: safe };
};

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const { data: stored } = await supabase.from('RefreshToken').select('*').eq('token', token).maybeSingle();
  
  if (!stored || new Date(stored.expiresAt) < new Date()) {
    if (stored) await supabase.from('RefreshToken').delete().eq('token', token);
    throw new AppError('Session expired, please log in again', 401);
  }
  return { accessToken: signAccessToken({ userId: payload.userId, role: payload.role }) };
};

export const logoutUser = async (token: string) => {
  if (token) await supabase.from('RefreshToken').delete().eq('token', token);
};

export const getMe = async (userId: string) => {
  const { data: user } = await supabase
    .from('User')
    .select(`*, patient:Patient(*), doctor:Doctor(*)`)
    .eq('id', userId)
    .maybeSingle();

  if (!user) throw new AppError('User not found', 404);
  const { passwordHash: _ph, ...safe } = user;
  
  // Transform nested arrays to objects if Supabase returns arrays for 1:1 relations
  if (safe.patient && Array.isArray(safe.patient)) safe.patient = safe.patient[0];
  if (safe.doctor && Array.isArray(safe.doctor)) safe.doctor = safe.doctor[0];
  
  return safe;
};

export const updateProfile = async (userId: string, role: string, input: UpdateProfileInput) => {
  const { data: user, error: userError } = await supabase.from('User').select('id').eq('id', userId).maybeSingle();
  if (!user || userError) throw new AppError('User not found', 404);

  // Clean up undefined values from input to prevent updating fields to null unintentionally
  const cleanInput = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));

  if (role === 'DOCTOR') {
    const { error: doctorError } = await supabase
      .from('Doctor')
      .update({
        ...(cleanInput.firstName && { firstName: cleanInput.firstName }),
        ...(cleanInput.lastName && { lastName: cleanInput.lastName }),
        ...(cleanInput.specialty && { specialty: cleanInput.specialty }),
        ...(cleanInput.bio !== undefined && { bio: cleanInput.bio }),
        ...(cleanInput.fee !== undefined && { fee: cleanInput.fee }),
        ...(cleanInput.yearsExp !== undefined && { yearsExp: cleanInput.yearsExp }),
        ...(cleanInput.avatarUrl !== undefined && { avatarUrl: cleanInput.avatarUrl }),
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId);

    if (doctorError) throw new AppError('Failed to update doctor profile', 500);
  } else if (role === 'PATIENT') {
    const { error: patientError } = await supabase
      .from('Patient')
      .update({
        ...(cleanInput.firstName && { firstName: cleanInput.firstName }),
        ...(cleanInput.lastName && { lastName: cleanInput.lastName }),
        ...(cleanInput.phone !== undefined && { phone: cleanInput.phone }),
        ...(cleanInput.dateOfBirth !== undefined && { dateOfBirth: cleanInput.dateOfBirth }),
        ...(cleanInput.gender !== undefined && { gender: cleanInput.gender }),
        ...(cleanInput.avatarUrl !== undefined && { avatarUrl: cleanInput.avatarUrl }),
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId);

    if (patientError) throw new AppError('Failed to update patient profile', 500);
  }

  return await getMe(userId);
};
