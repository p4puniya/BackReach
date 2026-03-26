/**
 * Exotel may send voice webhooks as POST (form body) or GET (query).
 * Merge query first, then body so body wins on duplicate keys.
 */
function getWebhookParams(req) {
  return { ...req.query, ...req.body };
}

function getSpeechResult(p) {
  const raw =
    p.SpeechResult ||
    p.Speech ||
    p.speech ||
    p.Digits ||
    p.digits ||
    '';
  return typeof raw === 'string' ? raw.trim() : String(raw || '').trim();
}

function getCallSid(p) {
  return p.CallSid || p.call_sid || '';
}

function getFromNumber(p) {
  return p.From || p.CallFrom || p.FromNumber || p.from || '';
}

/** Skip auto-callback when webhook is from an outbound API leg (loop prevention). */
function isOutboundWebhookContext(p) {
  const callType = String(p.CallType || p.call_type || '').toLowerCase();
  const direction = String(p.Direction || p.direction || '').toLowerCase();
  return callType === 'outbound-api' || direction === 'outbound-api';
}

module.exports = {
  getWebhookParams,
  getSpeechResult,
  getCallSid,
  getFromNumber,
  isOutboundWebhookContext,
};
