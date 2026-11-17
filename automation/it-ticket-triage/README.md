# IT Support Ticket Triage

An n8n workflow that sends IT requests to OpenAI for structured classification, applies explicit queue rules, and records the result in Google Sheets. Ambiguous and urgent requests go to human review. An invalid or unavailable model response also goes to review.

[Interactive portfolio replay](https://a-majid-portfolio-mauve.vercel.app/it-ticket-triage)

## Run in n8n

1. Import `workflow.json`. Start with manual execution, which submits the Microsoft 365 MFA ticket.
2. In **Classify with OpenAI**, attach an n8n Header Auth credential named for this integration. Set the header name to `Authorization` and its value to `Bearer YOUR_OPENAI_API_KEY`. The default model is `gpt-4o-mini`.
3. Create a Google spreadsheet with a tab named `Tickets`. Paste the columns from `sheet-headers.csv` into the first row. In **Log in Google Sheets**, connect your Google Sheets credential and enter the spreadsheet ID. Confirm **Append or Update Row**, match on `ticket_id`, and use raw cell input. Reruns with the same ID update the existing row when run sequentially.
4. Run the workflow manually. Verify `TKT-001` appears as **Identity / Routed**. Run it again and check the sheet still contains one record for that ID.
5. For incoming requests, configure a separate Header Auth credential on **Ticket webhook** using `X-Triage-Key` and a long random secret. Use n8n's test URL while listening or its production URL after activation. Keep the webhook private and serialize submissions when using Sheets as the only backing store.

```sh
curl --fail-with-body "$N8N_WEBHOOK_URL" \
  -H "X-Triage-Key: $TRIAGE_WEBHOOK_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"ticket_id":"TKT-004","subject":"Something is broken","description":"It is broken again. Please help."}'
```

## Present the workflow

Show TKT-001 going to Identity and TKT-004 going to human review. Then show the tracking sheet after repeating TKT-001. The browser replay uses predefined classification outputs and the same routing function as n8n. Tickets are fictional support scenarios.

The local checks cover all five ticket scenarios and four malformed or unavailable classifier responses. The live API, Google Sheets write, and duplicate-row check require connected credentials. Live routing accuracy and time saved have yet to be measured. For a timed comparison, record the active time needed to triage and log the same tickets manually, then compare against the active review time with automation.

## Files

- `workflow.json` — importable n8n workflow
- `tickets.json` — five tickets with expected categories and urgency
- `sheet-headers.csv` — spreadsheet columns
- `index.html` — self-contained portfolio replay
- `generate.cjs` and `demo.template` — source and local routing checks. Run `node generate.cjs` from this directory to regenerate the outputs.
