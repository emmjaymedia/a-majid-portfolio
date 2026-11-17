# Weekly Operations Brief

Project 4 of the AI & Workflow Automation series. An n8n workflow turns two weeks of Google Sheets data into an operations brief. JavaScript calculates the totals shown and week-over-week changes. OpenAI suggests follow-up actions. The brief retains the calculated data when suggestions are unavailable.

[Try the interactive replay](https://a-majid-portfolio-mauve.vercel.app/weekly-operations-brief)

## Run the workflow

1. Import `workflow.json` into n8n. Create a tab named **Weekly Metrics** in Google Sheets and import `weekly-metrics.csv`. Format week as plain text (YYYY-MM-DD, Monday). Include only weeks that have closed and use one row per week. Opened and closed are weekly counts. Overdue is the end-of-week count.
2. In **Read weekly metrics**, connect Google Sheets, enter the spreadsheet ID, and select the **Weekly Metrics** tab.
3. In **Draft follow-up suggestions**, attach an HTTP Header Auth credential. Set header name to `Authorization` and value to `Bearer YOUR_OPENAI_API_KEY`.
4. Run manually and inspect **Assemble brief**. The demo expects 24 opened (+7), 19 closed (+4), and 7 overdue (+3). Activate for scheduled runs on Mondays at 09:00 Doha time.
5. For each run, review the output in n8n execution details. The workflow produces a draft for review without sending a message.

The two most recent rows must describe consecutive weeks. Invalid counts, repeated week IDs and gaps stop the run. AI-generated suggestions are optional and filtered before returning the draft. The public replay uses fictional data and predefined suggestions. Live service execution requires credentials and has not been verified.

Run `node build.cjs` to regenerate the workflow, fixture CSV and replay, and run the eight local checks.
