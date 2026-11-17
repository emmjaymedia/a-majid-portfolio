const { meeting_id, notes, model_response } = input;
if (typeof meeting_id !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(meeting_id)) {
  throw new Error('Use a stable meeting ID of up to 60 letters, digits, hyphens or underscores.');
}
if (typeof notes !== 'string' || !notes.trim()) throw new Error('Meeting notes are required.');
const extracted = JSON.parse(model_response);
if (!Array.isArray(extracted?.actions)) throw new Error('Expected an actions array.');
const seen = new Set();
const rows = [];
const clean = value => typeof value === 'string' ? value.trim() : '';
for (const entry of extracted.actions) {
  const action = clean(entry?.action);
  const evidence = clean(entry?.evidence);
  if (!action || !evidence || !notes.includes(evidence)) throw new Error('Every action needs a verbatim excerpt from the notes.');
  const key = JSON.stringify([action.toLowerCase(), evidence]);
  if (seen.has(key)) continue;
  seen.add(key);
  const words = text => text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') ?? '';
  const supported = value => words(value) && (' ' + words(evidence) + ' ').includes(' ' + words(value) + ' ');
  const owner = clean(entry.owner);
  const due = clean(entry.due);
  const confirmedOwner = supported(owner) ? owner : '';
  const confirmedDue = supported(due) ? due : '';
  const review = [!confirmedOwner && 'Owner', !confirmedDue && 'Due date'].filter(Boolean).join(', ');
  rows.push({ meeting_id, action, owner: confirmedOwner, due: confirmedDue, evidence, status: review ? 'Needs review' : 'Ready to track', missing: review });
}
return { rows };
