const { Router } = require('express');
const { sayAndGather, sendVoiceXml } = require('../utils/exotelResponse');
const {
  getWebhookParams,
  getSpeechResult,
  getCallSid,
  getFromNumber,
} = require('../utils/webhookParams');
const { setPendingName } = require('../store/pendingNames');

const router = Router();

router.all('/', (req, res) => {
  const p = getWebhookParams(req);
  const speech = getSpeechResult(p);
  const callSid = getCallSid(p);
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  console.log('[name]', {
    CallSid: callSid,
    From: getFromNumber(p),
    speech,
  });
  if (!base) {
    console.error('[name] PUBLIC_BASE_URL is not set');
    return res.status(500).type('text/plain').send('PUBLIC_BASE_URL missing');
  }
  if (!speech) {
    return sendVoiceXml(
      res,
      sayAndGather('Aapka naam kya hai?', `${base}/name`)
    );
  }
  setPendingName(callSid, speech);
  const timePrompt =
    'Dhanyavaad. Aap appointment ke liye kaun sa samay pasand karenge? Kripya samay bataiye.';
  sendVoiceXml(res, sayAndGather(timePrompt, `${base}/time`));
});

module.exports = router;
