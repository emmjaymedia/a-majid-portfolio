# Meeting Notes to Action Tracker

Project 3 in the AI & Workflow Automation portfolio. Take meeting notes, extract agreed actions with OpenAI, and add one row per action to Google Sheets. Flag missing owners and deadlines for review.

[Try the interactive replay](https://a-majid-portfolio-mauve.vercel.app/meeting-action-tracker)

## Set up the Make scenario

1. Create a Google spreadsheet with two tabs. Add headers `meeting_id,notes` to **Meetings**. Add headers `meeting_id,action,owner,due,evidence,status,missing` to **Actions**. Keep both as plain-text tables.
2. Add **Google Sheets → Watch New Rows** for **Meetings**. Make one row per meeting and use a stable, unique meeting ID.
3. Add **OpenAI → Generate a response**. Connect OpenAI, put `prompt.md` in the instructions, map the notes into the text prompt, and select JSON Object as the output format. Leave tools and previous response ID unset.
4. Add **Make Code → Run code** in JavaScript mode. Add inputs `meeting_id` and `notes` from the Sheets trigger and `model_response` from the OpenAI output text. Paste `make-code.js`. Make Code requires a paid Make plan. Every action must have a verbatim excerpt. The code checks that owner and deadline values also appear within that excerpt.
5. Add **Flow Control → Iterator** on the Code module’s `rows` array. Add **Google Sheets → Add a Row** for **Actions** and map each field from the iterator. Set Value Input Option to **Raw**. An empty array results in zero writes.
6. Run once with a meeting from `cases.json`. Compare the action rows against the original notes, and use a filter on **Needs review** to identify rows that need someone to confirm an owner or deadline.

Malformed model output and unsupported excerpts stop the run before any action rows are written. The Meetings tab retains the source. The append-only tracker can duplicate rows if a meeting is resubmitted or a partial batch is restarted from the trigger. Before replaying, filter Actions by meeting ID and check which rows were already saved.

The browser demo uses fictional meeting notes and predefined extraction responses. It runs the same validation code as the Make scenario. Live Make, OpenAI and Google Sheets execution requires connected accounts. Extraction accuracy and time saved have yet to be measured.

Run `node build.cjs` to regenerate the browser demo and run local checks for complete actions, missing owners and deadlines, duplicate actions, fabricated dates, invalid JSON, missing evidence, and meetings without actions.
