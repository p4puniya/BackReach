const { Router } = require('express');
const { sayAndGather, sayAndHangup, sendVoiceXml } = require('../utils/exotelResponse');
const {
  getWebhookParams,
  getSpeechResult,
  getCallSid,
  getFromNumber,
} = require('../utils/webhookParams');

const router = Router();

function wantsBooking(text) {
  const t = String(text).toLowerCase();
  return ['haan', 'yes', 'book', 'appointment'].some((k) => t.includes(k));
}

router.all('/', (req, res) => {
  const p = getWebhookParams(req);
  const speech = getSpeechResult(p);
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  console.log('[step1]', {
    CallSid: getCallSid(p),
    From: getFromNumber(p),
    speech,
  });
  if (!base) {
    console.error('[step1] PUBLIC_BASE_URL is not set');
    return res.status(500).type('text/plain').send('PUBLIC_BASE_URL missing');
  }
  if (wantsBooking(speech)) {
    return sendVoiceXml(
      res,
      sayAndGather('Aapka naam kya hai?', `${base}/name`)
    );
  }
  sendVoiceXml(
    res,
    sayAndHangup(
      'Theek hai. Agar baad mein appointment chahiye ho to dubara call karein. Dhanyavaad.'
    )
  );
});

module.exports = router;
