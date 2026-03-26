function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapResponse(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

/**
 * TwiML-shaped XML for Exotel Connect / compatible parsers.
 */
function sayAndGather(message, actionUrl, options = {}) {
  const timeout = options.timeout ?? 10;
  const speechTimeout = options.speechTimeout ?? 'auto';
  const language = options.language ?? 'hi-IN';
  const msg = escapeXml(message);
  const url = escapeXml(actionUrl);
  const inner = `<Say language="${language}">${msg}</Say><Gather input="speech" action="${url}" method="POST" timeout="${timeout}" speechTimeout="${speechTimeout}" language="${language}"></Gather><Say language="${language}">Kripya dubara call karein.</Say><Hangup/>`;
  return wrapResponse(inner);
}

function sayAndHangup(message, options = {}) {
  const language = options.language ?? 'hi-IN';
  const msg = escapeXml(message);
  return wrapResponse(`<Say language="${language}">${msg}</Say><Hangup/>`);
}

function sendVoiceXml(res, xml) {
  res.type('text/xml; charset=utf-8');
  res.send(xml);
}

module.exports = {
  escapeXml,
  sayAndGather,
  sayAndHangup,
  sendVoiceXml,
};
