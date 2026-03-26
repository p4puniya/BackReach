const { createClient } = require('@supabase/supabase-js');
const { sendConfirmation } = require('./whatsappService');

let supabase;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_KEY missing');
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

async function createBooking({ name, phone, time }) {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('appointments')
    .insert({ name, phone, time })
    .select('id')
    .single();
  if (error) {
    console.error('[booking] supabase error', error);
    throw error;
  }
  console.log('[booking] saved', data);
  try {
    await sendConfirmation({ phone, time });
  } catch (e) {
    console.error('[booking] WhatsApp failed after DB save', e.message || e);
  }
}

module.exports = { createBooking };
