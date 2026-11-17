function normalizeEnquiry(enquiry, response) {
  const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  let ai;
  try { ai = JSON.parse(response); } catch {}
  const services = ['Website', 'Brand Identity', 'Workflow Automation', 'Other'];
  const category = services.includes(ai?.category) ? ai.category : '';
  const summary = clean(ai?.summary, 400);
  const draft = clean(ai?.draft, 1400);
  const usable = Boolean(category && summary && draft);
  const budget = clean(enquiry.budget, 120);
  const timeline = clean(enquiry.timeline, 120);
  const missing = [!budget && 'Budget', !timeline && 'Timeline'].filter(Boolean);
  return {
    service_category: usable ? category : 'Unclassified',
    lead_summary: usable ? summary : '',
    missing_details: missing.join(', '),
    follow_up_draft: usable ? draft + (missing.length ? '\n\nCould you share your ' + missing.join(' and ').toLowerCase() + '?' : '') : '',
    lead_status: !usable ? 'Needs manual drafting' : missing.length ? 'Needs details' : 'Ready for review'
  };
}

return normalizeEnquiry(inputData, inputData.model_response);
