const { Router } = require('express');
const {
  getWebhookParams,
  getFromNumber,
  getCallSid,
  isOutboundWebhookContext,
} = require('../utils/webhookParams');
const { normalizeToE164 } = require('../utils/phone');
const { triggerCallback } = require('../services/exotelService');
const { isDuplicateCallSid } = require('../store/missedCallDedupe');

const router = Router();

function shouldLogFullWebhook() {
  const v = process.env.LOG_MISSED_CALL_WEBHOOK;
  return v === '1' || String(v).toLowerCase() === 'true';
}

router.post('/missed-call', async (req, res) => {
  const p = getWebhookParams(req);
  const callSid = getCallSid(p);
  const fromRaw = getFromNumber(p);
  const normalized = normalizeToE164(fromRaw);

  console.log('[missed-call]', {
    CallSid: callSid,
    From: fromRaw,
    normalized,
    keys: Object.keys(p),
  });

  if (shouldLogFullWebhook()) {
    console.log('[missed-call] webhook payload (LOG_MISSED_CALL_WEBHOOK)', p);
  }

  const ok = (body) => res.status(200).json(body);

  if (isOutboundWebhookContext(p)) {
    console.log('[missed-call] skip outbound leg (loop prevention)', {
      CallType: p.CallType,
      Direction: p.Direction,
    });
    return ok({ ok: true, skipped: 'outbound_leg' });
  }

  if (isDuplicateCallSid(callSid)) {
    console.log('[missed-call] duplicate CallSid within TTL, skip callback', { callSid });
    return ok({ ok: true, skipped: 'duplicate_callsid' });
  }

  if (!normalized) {
    console.warn('[missed-call] no caller number in webhook');
    return ok({ ok: false, error: 'missing_from' });
  }

  try {
    await triggerCallback(normalized);
    return ok({ ok: true });
  } catch (err) {
    console.error('[missed-call] triggerCallback failed', err);
    return ok({ ok: false, error: 'callback_failed' });
  }
});

module.exports = router;
