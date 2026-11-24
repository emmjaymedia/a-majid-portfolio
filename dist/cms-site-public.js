import {websiteContent, applyContent} from './site-content.js';

// Replace known template copy without overwriting edits made through the dashboard.
const legacy = {
  "role": [
    "Software Engineer + Product Designer",
    "Front-end Developer + Product Designer"
  ],
  "heroTitle": [
    "Different hats.\nOne product mindset.",
    "Good ideas.\nBuilt to matter.",
    "I design brands & digital products, and build web & mobile app experiences that bring them to life."
  ],
  "heroDescription": [
    "I connect product design, software engineering, IT, and project delivery to turn complex ideas into useful digital experiences.",
    "I design and build digital products, connecting thoughtful user experiences with the engineering that brings them to life.",
    "Over ten years across design and technology, connecting thoughtful UX with responsive web development and mobile app experiences."
  ],
  "navProjects": [
    "Projects"
  ],
  "navWork": [
    "Work"
  ],
  "resumeLabel": [
    "My Resume"
  ],
  "availability": [
    "Available for Projects"
  ],
  "avatar": [
    "/images/profile-portrait.png",
    "/images/profile-portrait.png"
  ],
  "avatarAlt": [
    ""
  ],
  "projectsHeading": [
    "Ideas, made real.",
    "Featured Projects*"
  ],
  "aboutHeading": [
    "One person.\nMany ways to build.",
    "About me"
  ],
  "aboutLead": [
    "I’m Abdulmajid Abdurrahim, a software engineer, product designer, and project professional based in Doha, Qatar. My work connects user needs, business goals, and technical delivery—from shaping user journeys and interfaces to building applications and coordinating the work that brings them to life. I work across React, Next.js, TypeScript, back-end integrations, and workplace IT, with experience spanning creative studios, technology products, energy, and operations."
  ],
  "toolkitHeading": [
    "Front-end toolkit"
  ],
  "toolkitDescription": [
    "From web and mobile interface design to working products: reusable components, state management, API integration, and responsive styling."
  ],
  "aboutStory": [
    "Being a father has made me more intentional about what I build and the impact it has on people. I bring that same care to product and brand design, product engineering, motion design, and video editing, while managing projects across IT, creative, construction, and operations. Whether I’m shaping a product or leading a team, I focus on making ideas clear, useful, and well executed. I can help you with:"
  ],
  "contactHeading": [
    "Have an idea?\nLet’s make it work.",
    "Let’s build you\nsomething really cool"
  ],
  "contactLabel": [
    "Shoot me an email"
  ],
  "credit": [
    "Built with ☕, Figma & Codex"
  ],
  "pageTitle": [
    "A. Majid — Design, Engineering & Technology",
    "A. Majid — Front-end Development & Product Design"
  ],
  "metaDescription": [
    "Abdulmajid Abdurrahim — software engineer, product designer, and project professional in Doha, Qatar. Explore nine expertise areas including OT cyber security, plus projects, experience, and Cisco training.",
    "Abdulmajid Abdurrahim — software engineer, product designer, and project professional in Doha, Qatar. Explore eight expertise areas, projects, experience, and certifications.",
    "A. Majid is a software engineer and product designer based in Doha, Qatar. Explore front-end, back-end, full-stack, AI, product design, and IT expertise."
  ],
  "services": [
    [
      "Software Engineering",
      "Product Design",
      "Front-end Development",
      "Project Management",
      "IT & Cloud Administration"
    ],
    [
      "Brand Design",
      "Product Design",
      "Web & Mobile Development",
      "Product Management",
      "Motion Design"
    ]
  ],
  "skills": [
    [
      "JavaScript",
      "TypeScript",
      "React",
      "React Native",
      "Angular",
      "Next.js",
      "Vue.js",
      "Nuxt.js",
      "HTML5",
      "CSS3 / SCSS",
      "Tailwind CSS",
      "Redux Toolkit",
      "Git / GitHub"
    ]
  ]
};

try {
  const [row, defaults] = await Promise.all([
    websiteContent(),
    fetch('/site-content.json').then(response => response.json()),
  ]);
  const content = {...defaults, ...row.content};
  for (const [key, values] of Object.entries(legacy)) {
    if (values.some(value => JSON.stringify(value) === JSON.stringify(content[key]))) {
      content[key] = defaults[key];
    }
  }
  applyContent(content);
} catch (error) {
  console.error('Using built-in website content:', error.message);
}
