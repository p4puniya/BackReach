const axios = require('axios');
const qs = require('querystring');

/**
 * Outbound call: customer answers first, then hears flow at Url.
 * @see https://developer.exotel.com/api/make-a-call-api
 */
async function triggerCallback(customerE164) {
  const key = process.env.EXOTEL_API_KEY;
  const token = process.env.EXOTEL_API_TOKEN;
  const sid = process.env.EXOTEL_SID;
  const host = process.env.EXOTEL_API_HOST || 'api.in.exotel.com';
  const callerId = process.env.EXOTEL_CALLER_ID;
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!key || !token || !sid || !callerId || !base) {
    throw new Error('exotel_callback_env_incomplete');
  }
  const voiceUrl = `${base}/voice`;
  const body = qs.stringify({
    From: customerE164.replace(/^\+/, ''),
    CallerId: callerId.replace(/^\+/, ''),
    Url: voiceUrl,
  });
  const url = `https://${host}/v1/Accounts/${sid}/Calls/connect`;
  console.log('[exotel] Calls/connect', { From: customerE164, CallerId: callerId, Url: voiceUrl });
  const res = await axios.post(url, body, {
    auth: { username: key, password: token },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
    validateStatus: (s) => s < 500,
  });
  if (res.status >= 400) {
    console.error('[exotel] connect failed', res.status, res.data);
    throw new Error(`exotel_connect_${res.status}`);
  }
  console.log('[exotel] connect ok', res.status, res.data);
}

module.exports = { triggerCallback };
