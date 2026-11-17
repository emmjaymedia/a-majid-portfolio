# Client Enquiry to Sales Pipeline

Project 2 in Abdulmajid Abdurrahim’s AI & Workflow Automation series. A website enquiry becomes an enriched lead with a service category, missing-information check, and follow-up draft for human review.

[Try the interactive replay](https://a-majid-portfolio-mauve.vercel.app/client-enquiry-pipeline)

## Build the Zap

1. In Zapier Tables, create a leads table. Add intake fields `name`, `email`, `company`, `message`, `budget`, and `timeline`. Add long-text output fields `service_category`, `lead_summary`, `missing_details`, `follow_up_draft`, and `lead_status`. Leave output fields blank on intake.
2. In Zapier Forms, create a form connected to the leads table. Expose only the intake fields. Require name, valid email, and message. Keep budget and timeline optional.
3. Trigger the Zap with **Zapier Tables → New Record** on the leads table. Use **ChatGPT (OpenAI) → Conversation**, connect OpenAI, and paste `prompt.md` into Instructions. Map only the enquiry message into User Message and choose JSON Object when available. Leave memory and tools unset.
4. Use **Code by Zapier → Run JavaScript**. Paste `code-by-zapier.js`. Map `budget` and `timeline` from the initial record and `model_response` from the Conversation step’s output text. The code validates the category, summary, and draft and checks whether the two optional fields are filled.
5. Use **Zapier Tables → Update Record**. Map the record ID from the trigger and the five fields returned by the code step. The Zap enriches the original record. Replaying that update targets the same record, while a new form submission creates a new lead. Review the draft in the table before sending it through your normal sales process.

## Verify

- Submit a complete enquiry. Expect **Ready for review** and a draft.
- Submit an enquiry with both budget and timeline blank. Expect **Needs details** and a draft requesting both.
- Test the Code step with malformed JSON. Expect **Needs manual drafting** and a blank draft.
- If the OpenAI action itself fails, Zapier stops that run and the original intake remains in the table. Inspect run history and replay it after resolving the error.

The public replay contains fictional leads and predefined model responses, runs the same validation and draft preparation code, and displays the resulting lead without writing to the live table. Live Zapier and OpenAI execution still requires account connections. Timing and model accuracy have yet to be measured.

Run local regression checks and regenerate the HTML with `node build.cjs`.
