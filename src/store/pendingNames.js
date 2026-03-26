/** @type {Map<string, string>} */
const pendingNameByCallSid = new Map();

function setPendingName(callSid, name) {
  if (callSid) pendingNameByCallSid.set(callSid, name);
}

function takePendingName(callSid) {
  if (!callSid) return undefined;
  const name = pendingNameByCallSid.get(callSid);
  pendingNameByCallSid.delete(callSid);
  return name;
}

module.exports = {
  setPendingName,
  takePendingName,
};
