/** Ignore duplicate HTTP posts for the same Exotel CallSid within this window. */
const TTL_MS = 5 * 60 * 1000;
const seen = new Map();

function prune() {
  const now = Date.now();
  for (const [k, t] of seen) {
    if (now - t > TTL_MS) seen.delete(k);
  }
}

/**
 * @returns {boolean} true if this CallSid was already handled recently (skip callback)
 */
function isDuplicateCallSid(callSid) {
  if (!callSid) return false;
  prune();
  if (seen.has(callSid)) return true;
  seen.set(callSid, Date.now());
  return false;
}

module.exports = { isDuplicateCallSid };
