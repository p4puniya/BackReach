const axios = require('axios');

function stripPlus(n) {
  return String(n || '').replace(/^\+/, '');
}

/**
 * Exotel v2 Send Messages API (WhatsApp).
 * @see https://developer.exotel.com/api/send-messages-api
 */
async function sendConfirmation({ phone, time }) {
  const key = process.env.EXOTEL_API_KEY;
  const token = process.env.EXOTEL_API_TOKEN;
  const sid = process.env.EXOTEL_SID;
  const host = process.env.EXOTEL_API_HOST || 'api.in.exotel.com';
  const from = process.env.EXOTEL_WHATSAPP_FROM;
  if (!key || !token || !sid || !from) {
    console.warn('[whatsapp] missing EXOTEL_* env; skipping send');
    return;
  }
  const payload = {
    whatsapp: {
      messages: [
        {
          from: stripPlus(from),
          to: stripPlus(phone),
          content: {
            recipient_type: 'individual',
            type: 'text',
            text: {
              preview_url: false,
              body: `Your appointment is confirmed for ${time}`,
            },
          },
        },
      ],
    },
  };
  const url = `https://${host}/v2/accounts/${sid}/messages`;
  console.log('[whatsapp] sending to', stripPlus(phone));
  const res = await axios.post(url, payload, {
    auth: { username: key, password: token },
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
    validateStatus: (s) => s < 500,
  });
  if (res.status >= 400) {
    console.error('[whatsapp] API error', res.status, res.data);
    throw new Error(`whatsapp_api_${res.status}`);
  }
  console.log('[whatsapp] sent', res.status, res.data);
}

module.exports = { sendConfirmation };
