const { Router } = require('express');
const { sayAndHangup, sendVoiceXml } = require('../utils/exotelResponse');
const {
  getWebhookParams,
  getSpeechResult,
  getCallSid,
  getFromNumber,
} = require('../utils/webhookParams');
const { takePendingName } = require('../store/pendingNames');
const { normalizeToE164 } = require('../utils/phone');
const { createBooking } = require('../services/bookingService');

const router = Router();

router.all('/', async (req, res) => {
  const p = getWebhookParams(req);
  const speech = getSpeechResult(p);
  const callSid = getCallSid(p);
  const fromRaw = getFromNumber(p);
  const phone = normalizeToE164(fromRaw);
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  console.log('[time]', {
    CallSid: callSid,
    From: fromRaw,
    phone,
    speech,
  });
  if (!base) {
    console.error('[time] PUBLIC_BASE_URL is not set');
    return res.status(500).type('text/plain').send('PUBLIC_BASE_URL missing');
  }
  const name = takePendingName(callSid);
  if (!speech || !name || !phone) {
    console.warn('[time] missing speech, name, or phone — closing call');
    return sendVoiceXml(
      res,
      sayAndHangup(
        'Maaf kijiye, hum aapki jaankari poori nahin kar paaye. Kripya dubara call karein.'
      )
    );
  }
  try {
    await createBooking({ name, phone, time: speech });
    sendVoiceXml(
      res,
      sayAndHangup('Aapka appointment confirm kar diya gaya hai. Dhanyavaad.')
    );
  } catch (err) {
    console.error('[time] booking failed', err);
    sendVoiceXml(
      res,
      sayAndHangup(
        'Maaf kijiye, abhi booking save nahin ho payi. Kripya thodi der baad dubara call karein.'
      )
    );
  }
});

module.exports = router;
