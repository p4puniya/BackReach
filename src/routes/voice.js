const { Router } = require('express');
const { sayAndGather, sendVoiceXml } = require('../utils/exotelResponse');
const { getWebhookParams, getCallSid, getFromNumber } = require('../utils/webhookParams');

const router = Router();

router.all('/', (req, res) => {
  const p = getWebhookParams(req);
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  console.log('[voice]', {
    method: req.method,
    CallSid: getCallSid(p),
    From: getFromNumber(p),
    keys: Object.keys(p),
  });
  if (!base) {
    console.error('[voice] PUBLIC_BASE_URL is not set');
    return res.status(500).type('text/plain').send('PUBLIC_BASE_URL missing');
  }
  const message =
    'Namaste, aapne doctor clinic pe call kiya tha. Kya aap appointment book karna chahte hain?';
  sendVoiceXml(res, sayAndGather(message, `${base}/step1`));
});

module.exports = router;
