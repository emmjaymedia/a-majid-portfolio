export const darloStory = {
  headline: 'Keeping the next action visible in property sales',
  role: 'Product design',
  status: 'Independent concept',
  flow: ['Review enquiry', 'Confirm requirements', 'Schedule viewing', 'Record outcome', 'Follow up'],
  chapters: [
    ['Designing for agents on the move', 'The concept follows a property agent from enquiry through viewing and follow-up. An agent opening a lead between appointments needs to see the last interaction and decide what to do next. The sprint explored that question through a mobile-first flow.'],
    ['One workflow in English and Arabic', 'The mobile designs cover lead details, viewing schedules, and follow-ups in both languages. Arabic uses a right-to-left layout, so navigation and directional cues have to work in both reading orders.'],
    ['Keeping follow-up drafts editable', 'AI assistance is intended to summarize recorded lead activity and propose an editable follow-up. The agent can review the context and decide what to send. The AI features and integrations are simulated in this concept.'],
    ['What I would test next', 'Give English- and Arabic-speaking agents the same scenario. Ask them to find a lead, schedule a viewing, and prepare a follow-up. Observe where they hesitate and whether they can explain the next action in each language.'],
  ],
};

export const featuredStudies = new Map([
  ['order-exception-desk', {
    title: 'Order Exception Desk',
    category: 'Fullstack Developer',
    year: 2026,
    headline: 'Giving purchase orders a review step before ERP export',
    role: 'Full-stack development',
    status: 'Deployed demo',
    flow: ['Upload order', 'Inspect exceptions', 'Approve order', 'Export CSV'],
    description: 'A browser-based workspace for reviewing purchase orders against catalog and inventory data before exporting approved rows.',
    chapters: [
      ['What needs a reviewer’s attention', 'The application checks for missing units, price mismatches, stock shortages, and unmapped parts. Those checks identify the lines a reviewer needs to resolve before approval.'],
      ['From upload to a usable export', 'The frontend presents flagged orders and their exceptions. The FastAPI backend handles processing, and the workflow produces an ERP-ready CSV after approval.'],
      ['What the demo can show', 'Run a sample purchase order through the review flow to see which checks trigger and how approved lines appear in the exported file.'],
    ],
    stack: ['Next.js', 'React', 'FastAPI'],
    links: [
      {label: 'Try the live demo', url: 'https://order-exception-desk.vercel.app/'},
      {label: 'View source', url: 'https://github.com/emmjaymedia/order-exception-desk'},
    ],
  }],
  ['it-ticket-triage', {
    title: 'IT Support Ticket Triage',
    category: 'AI Engineer',
    year: 2026,
    headline: 'Routing support requests when the input is incomplete',
    role: 'AI workflow engineering',
    status: 'Prototype with synthetic tickets',
    flow: ['Read original ticket', 'Propose classification', 'Apply routing rules', 'Route or review'],
    description: 'An n8n workflow turns free-text support requests into structured classification suggestions and keeps each result tied to the original ticket ID.',
    chapters: [
      ['The ambiguous ticket', 'A request like “It stopped working again” can sound classifiable even though it omits the affected service. That makes it hard to justify a queue assignment from the text alone.'],
      ['The review path', 'The model proposes a classification, then explicit routing rules check the output. Ambiguous or urgent tickets and invalid or unavailable responses go to human review. The ticket ID lets the reviewer compare the suggestion with the original request.'],
      ['What the replay verifies', 'The browser replay uses fictional tickets, predefined classification results, and the same routing function as the n8n workflow. Local checks cover five example tickets and four malformed or unavailable responses. Live routing accuracy and time saved are unmeasured.'],
    ],
    stack: ['n8n', 'OpenAI', 'Google Sheets'],
    links: [
      {label: 'Try the interactive replay', url: '/it-ticket-triage'},
      {label: 'View workflow and local checks', url: 'https://github.com/emmjaymedia/a-majid-portfolio/tree/master/automation/it-ticket-triage'},
    ],
  }],
  ['sendeva-delivery', {
    title: 'Product Delivery at Sendeva',
    category: 'Project Manager',
    year: 2026,
    headline: 'Connecting product requirements, engineering, and early access',
    role: 'Product & Technology Lead',
    status: 'Role overview',
    description: 'At Sendeva Technologies, my work spans product requirements, user experience, engineering coordination, vendor demonstrations, and early-access communication.',
    chapters: [
      ['Scope and delivery', 'I work across requirements and UI/UX, then coordinate engineering work against the agreed product direction.'],
      ['Vendor and early-access work', 'I support vendor demonstrations and early-access communication, explaining what the product does and aligning the messaging with the current product scope.'],
    ],
    links: [{label: 'See the experience entry', url: '/#sendeva'}],
  }],
]);
