const axios = require('axios');
const qs = require('querystring');

/**
 * Missed-call recovery: Exotel dials the patient first (`From` = customer E.164),
 * then connects that leg to the IVR at `Url`. `CallerId` is your ExoPhone (CLI).
 * This is the "outgoing call to connect number to a call flow" shape — not the
 * two-leg From/To connect variant.
 *
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
  // .json suffix returns JSON response body (easier to log); params stay form-urlencoded.
  const url = `https://${host}/v1/Accounts/${sid}/Calls/connect.json`;
  console.log('[exotel] Calls/connect.json', {
    From: customerE164,
    CallerId: callerId,
    Url: voiceUrl,
  });
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
