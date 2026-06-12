import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { supabase } from '../utils/supabase';
import { AppError } from '../middleware/errorHandler';

// ─── MTN MoMo ────────────────────────────────────────────────────────────────

export const initiateMtnPayment = async (params: {
  phone: string;
  amount: number;
  appointmentId: string;
  currency?: string;
}): Promise<{ externalRef: string; status: string }> => {
  const externalRef = uuidv4();
  const currency = params.currency ?? 'EUR'; // MTN sandbox uses EUR; production: XAF

  const headers = {
    'Ocp-Apim-Subscription-Key': env.MTN_SUBSCRIPTION_KEY,
    'X-Reference-Id': externalRef,
    'X-Target-Environment': env.MTN_TARGET_ENVIRONMENT,
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${env.MTN_API_USER}:${env.MTN_API_KEY}`).toString('base64')}`,
  };

  try {
    await axios.post(
      `${env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: String(params.amount),
        currency,
        externalId: params.appointmentId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: params.phone.replace(/\s+/g, ''),
        },
        payerMessage: 'HMS Doctor Consultation Fee',
        payeeNote: `Appointment ${params.appointmentId}`,
      },
      { headers },
    );
    return { externalRef, status: 'PENDING' };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'MTN MoMo request failed';
    throw new AppError(msg, 502);
  }
};

export const checkMtnPaymentStatus = async (externalRef: string): Promise<string> => {
  try {
    const { data } = await axios.get(
      `${env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay/${externalRef}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': env.MTN_SUBSCRIPTION_KEY,
          'X-Target-Environment': env.MTN_TARGET_ENVIRONMENT,
          Authorization: `Basic ${Buffer.from(`${env.MTN_API_USER}:${env.MTN_API_KEY}`).toString('base64')}`,
        },
      },
    );
    return (data.status as string).toUpperCase();
  } catch {
    return 'UNKNOWN';
  }
};

// ─── Orange Money ─────────────────────────────────────────────────────────────

const getOrangeToken = async (): Promise<string> => {
  const creds = Buffer.from(`${env.ORANGE_CLIENT_ID}:${env.ORANGE_CLIENT_SECRET}`).toString('base64');
  const { data } = await axios.post(
    `${env.ORANGE_MONEY_BASE_URL}/oauth/v3/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return data.access_token as string;
};

export const initiateOrangePayment = async (params: {
  phone: string;
  amount: number;
  appointmentId: string;
}): Promise<{ externalRef: string; paymentUrl?: string; status: string }> => {
  try {
    const token = await getOrangeToken();
    const externalRef = uuidv4();

    const { data } = await axios.post(
      `${env.ORANGE_MONEY_BASE_URL}/orange-money-webpay/cm/v1/webpayment`,
      {
        merchant_key: env.ORANGE_CLIENT_ID,
        currency: 'XAF',
        order_id: externalRef,
        amount: params.amount,
        return_url: `${env.ORANGE_CALLBACK_URL}?ref=${externalRef}`,
        cancel_url: `${env.ORANGE_CALLBACK_URL}?ref=${externalRef}&cancelled=true`,
        notif_url: env.ORANGE_CALLBACK_URL,
        lang: 'en',
        reference: params.appointmentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return { externalRef, paymentUrl: data.payment_url, status: 'PENDING' };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Orange Money request failed';
    throw new AppError(msg, 502);
  }
};

// ─── Generic payment initiation ───────────────────────────────────────────────

export const initiatePayment = async (params: {
  appointmentId: string;
  provider: 'MTN' | 'ORANGE';
  phone: string;
}) => {
  const { data: appointment } = await supabase.from('Appointment')
    .select(`*, doctor:Doctor(*), patient:Patient(user:User(*))`)
    .eq('id', params.appointmentId)
    .maybeSingle();

  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.status !== 'PENDING_PAYMENT')
    throw new AppError('Appointment is not awaiting payment', 400);

  const { data: existing } = await supabase.from('Payment').select('*').eq('appointmentId', params.appointmentId).maybeSingle();
  if (existing && existing.status === 'SUCCEEDED') throw new AppError('Already paid', 409);

  if (appointment.doctor && Array.isArray(appointment.doctor)) appointment.doctor = appointment.doctor[0];
  const amount = appointment.doctor.fee;

  let externalRef: string;
  let paymentUrl: string | undefined;

  if (params.provider === 'MTN') {
    const result = await initiateMtnPayment({ phone: params.phone, amount, appointmentId: params.appointmentId });
    externalRef = result.externalRef;
  } else {
    const result = await initiateOrangePayment({ phone: params.phone, amount, appointmentId: params.appointmentId });
    externalRef = result.externalRef;
    paymentUrl = result.paymentUrl;
  }

  // Upsert payment record
  if (existing) {
    await supabase.from('Payment').update({
      externalRef,
      provider: params.provider,
      phone: params.phone,
      status: 'PENDING',
    }).eq('appointmentId', params.appointmentId);
  } else {
    await supabase.from('Payment').insert({
      appointmentId: params.appointmentId,
      amount,
      currency: 'XAF',
      provider: params.provider,
      phone: params.phone,
      externalRef,
      status: 'PENDING',
    });
  }

  return { externalRef, paymentUrl, amount, provider: params.provider };
};

export const verifyPayment = async (appointmentId: string) => {
  const { data: payment } = await supabase.from('Payment').select('*').eq('appointmentId', appointmentId).maybeSingle();
  if (!payment) throw new AppError('Payment record not found', 404);
  if (!payment.externalRef) throw new AppError('No payment reference', 400);

  let providerStatus = 'UNKNOWN';
  if (payment.provider === 'MTN') {
    providerStatus = await checkMtnPaymentStatus(payment.externalRef);
  }

  const succeeded = providerStatus === 'SUCCESSFUL' || providerStatus === 'SUCCESS';
  const failed = providerStatus === 'FAILED';

  if (succeeded) {
    await supabase.from('Payment').update({ status: 'SUCCEEDED', momoStatus: providerStatus }).eq('appointmentId', appointmentId);
    await supabase.from('Appointment').update({ status: 'CONFIRMED' }).eq('id', appointmentId);
  } else if (failed) {
    await supabase.from('Payment').update({ status: 'FAILED', momoStatus: providerStatus }).eq('appointmentId', appointmentId);
  }

  const { data: updated } = await supabase.from('Payment').select('*').eq('appointmentId', appointmentId).maybeSingle();
  return updated;
};

export const handleMtnCallback = async (body: Record<string, unknown>) => {
  const ref = body.externalId as string | undefined;
  const status = (body.status as string | undefined)?.toUpperCase();
  if (!ref || !status) return;

  const { data: payment } = await supabase.from('Payment').select('*').eq('externalRef', ref).maybeSingle();
  if (!payment) return;

  if (status === 'SUCCESSFUL') {
    await supabase.from('Payment').update({ status: 'SUCCEEDED', momoStatus: status }).eq('id', payment.id);
    await supabase.from('Appointment').update({ status: 'CONFIRMED' }).eq('id', payment.appointmentId);
  } else if (status === 'FAILED') {
    await supabase.from('Payment').update({ status: 'FAILED', momoStatus: status }).eq('id', payment.id);
  }
};

export const handleOrangeCallback = async (query: Record<string, string>) => {
  const ref = query.ref;
  const cancelled = query.cancelled === 'true';
  if (!ref) return;

  const { data: payment } = await supabase.from('Payment').select('*').eq('externalRef', ref).maybeSingle();
  if (!payment) return;

  if (cancelled) {
    await supabase.from('Payment').update({ status: 'FAILED', momoStatus: 'CANCELLED' }).eq('id', payment.id);
  } else {
    await supabase.from('Payment').update({ status: 'SUCCEEDED', momoStatus: 'SUCCESS' }).eq('id', payment.id);
    await supabase.from('Appointment').update({ status: 'CONFIRMED' }).eq('id', payment.appointmentId);
  }
};
