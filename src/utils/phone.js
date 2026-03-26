/**
 * Best-effort E.164 for India (+91) from Exotel-style caller IDs.
 */
function normalizeToE164(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return d ? `+${d}` : '';
}

module.exports = { normalizeToE164 };
