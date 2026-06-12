import { supabase } from './utils/supabase';
import { hashPassword } from './utils/hash';

async function main() {
  console.log('Seeding Supabase Database...');

  // Create Admin
  const adminPassword = await hashPassword('Admin@1234');
  const { data: adminUser, error: adminErr } = await supabase.from('User').insert({
    email: 'admin@hms.com',
    passwordHash: adminPassword,
    role: 'ADMIN',
  }).select().single();
  
  if (adminErr) console.error('Admin seed error (might exist):', adminErr.message);

  // Create Patient
  const patientPassword = await hashPassword('Patient@1234');
  const { data: patUser, error: patErr } = await supabase.from('User').insert({
    email: 'patient@hms.com',
    passwordHash: patientPassword,
    role: 'PATIENT',
  }).select().single();

  if (!patErr && patUser) {
    await supabase.from('Patient').insert({
      userId: patUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '237600000000',
      gender: 'MALE',
    });
  }

  // Create Doctor
  const doctorPassword = await hashPassword('Doctor@1234');
  const { data: docUser, error: docErr } = await supabase.from('User').insert({
    email: 'dr.amara@hms.com',
    passwordHash: doctorPassword,
    role: 'DOCTOR',
  }).select().single();

  if (!docErr && docUser) {
    const { data: doc } = await supabase.from('Doctor').insert({
      userId: docUser.id,
      firstName: 'Amara',
      lastName: 'Okonkwo',
      specialty: 'Cardiologist',
      bio: 'Expert in heart-related conditions with over 10 years of experience.',
      yearsExp: 10,
      fee: 15000,
      isVerified: true
    }).select().single();

    if (doc) {
      // Add Time slots for the next 3 days
      const slots = [];
      for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        slots.push({ doctorId: doc.id, date: dateStr, startTime: '09:00', endTime: '09:30' });
        slots.push({ doctorId: doc.id, date: dateStr, startTime: '09:30', endTime: '10:00' });
        slots.push({ doctorId: doc.id, date: dateStr, startTime: '10:00', endTime: '10:30' });
      }
      await supabase.from('TimeSlot').insert(slots);
    }
  }

  console.log('Seeding complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
