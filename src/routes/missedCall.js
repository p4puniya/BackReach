const { Router } = require('express');
const { getWebhookParams, getFromNumber } = require('../utils/webhookParams');
const { normalizeToE164 } = require('../utils/phone');
const { triggerCallback } = require('../services/exotelService');

const router = Router();

router.post('/missed-call', async (req, res) => {
  const p = getWebhookParams(req);
  const fromRaw = getFromNumber(p);
  const normalized = normalizeToE164(fromRaw);
  console.log('[missed-call]', { From: fromRaw, normalized, keys: Object.keys(p) });
  try {
    if (!normalized) {
      console.warn('[missed-call] no caller number in webhook');
      return res.status(400).json({ ok: false, error: 'missing_from' });
    }
    await triggerCallback(normalized);
    res.json({ ok: true });
  } catch (err) {
    console.error('[missed-call] triggerCallback failed', err);
    res.status(502).json({ ok: false, error: 'callback_failed' });
  }
});

module.exports = router;
