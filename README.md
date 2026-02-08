# Leadership Plain HTML v12

A static, single-page leadership learning experience built for Listerdale Life Sciences.

The site presents core leadership frameworks as a visual module grid, with deeper standalone module pages and a guided decision-tree diagnostic for "messy Tuesday" management situations.

## What this project is

- A plain HTML/CSS/JS website (no framework, no build tooling).
- A one-page "leadership book" (`index.html`) with cards linking to detailed modules.
- A diagnostic flow (`js/diagnostic.js`) that helps users choose the right reading path based on real-world leadership scenarios.
- A set of standalone module pages in `modules/` for deeper learning and practical application.

## Key features

- Interactive homepage with 9 themed sections of leadership content.
- "Start Here" scenario cards that deep-link into `modules/messy-tuesday.html`.
- 60-second modal diagnostic that asks branching questions and returns a recommended module sequence.
- Embedded module reading mode in the diagnostic via iframe.
- Consistent visual system using shared styles in `css/styles.css`.
- Responsive layout optimized for desktop, tablet, and mobile.
- PWA/web-app metadata and favicon assets (`site.webmanifest`, touch icons, favicons).

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (IIFE pattern, no dependencies)
- Google Fonts (`Space Grotesk`, `Inter`)

## Project structure

```text
.
├── index.html                  # Main one-page module hub
├── css/
│   └── styles.css              # Shared styling for homepage + module pages + diagnostic modal
├── js/
│   └── diagnostic.js           # Interactive decision tree and guided reading modal
├── modules/                    # Standalone module pages
├── images/                     # Brand/logo and illustration assets
├── site.webmanifest            # Web app manifest
├── favicon* / apple-touch*     # Icon assets
└── README.md
```

## Module map

The homepage organizes modules into these sections:

1. Foundations: Purpose, Authority & Context
2. Self-Leadership & Cognitive Load
3. Communication Fundamentals
4. Coaching & Development
5. Delegation & Accountability
6. Team Dynamics & Conflict
7. Performance Management & Hard Decisions
8. External Leadership
9. The Hard Edges

Current module pages in `modules/`:

- `10-minute-coaching.html`
- `20-questions-firing.html`
- `4cs-communication.html`
- `5-dysfunctions.html`
- `accountability.html`
- `annual-review.html`
- `authority-power.html`
- `better-breaks.html`
- `coach-your-team.html`
- `coaching-questions.html`
- `conflict-resolution.html`
- `decision-making.html`
- `delegation-founders.html`
- `give-feedback.html`
- `growth-stage.html`
- `leadership-stages.html`
- `less-stressed-ceo.html`
- `messy-tuesday.html`
- `prioritisation.html`
- `problem-employee.html`
- `psychology-motivation.html`
- `situational-leadership.html`
- `stakeholder-management.html`
- `start-with-why.html`
- `take-feedback.html`
- `uncomfortable-truths.html`

## Run locally

Because this is a static site, you can run it with any local HTTP server.

```bash
# from project root
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

Notes:

- Opening files directly with `file://` can break some browser behaviors; use an HTTP server.
- The diagnostic module embeds pages via iframe, which also works best over HTTP.

## How the diagnostic works

The diagnostic logic lives in `js/diagnostic.js`:

- `tree` defines the question graph and branching options.
- `results` defines outcome cards, module paths, and reality-check guidance.
- UI is mounted dynamically into the page as a modal overlay.
- A trigger button with `id="diagnostic-trigger"` in `index.html` opens the flow.

To update the diagnostic:

1. Edit question nodes in `tree`.
2. Edit outcome definitions in `results`.
3. Ensure each module URL points to an existing file in `modules/`.
4. Test all branches manually from the homepage.

## Content editing guide

For homepage module cards:

- Edit `index.html`.
- Keep card class names and grid span classes consistent to preserve layout.

For module page content:

- Edit files in `modules/`.
- Keep shared shell structure (`header`, hero, content sections) for visual consistency.

For global styling:

- Edit `css/styles.css`.
- Re-test at mobile and desktop breakpoints after changes.

## Deployment

This project can be deployed to any static host, including:

- GitHub Pages
- Netlify
- Vercel (static output)
- Cloudflare Pages
- S3 + CloudFront

Deployment artifact is the repository root as-is (no build step required).

## Quality checklist

Before publishing changes:

1. Load `index.html` and click every module card.
2. Run the diagnostic and validate each outcome path.
3. Confirm header/footer links and external links work.
4. Check layout at mobile and desktop widths.
5. Verify icon/manifest assets still resolve.

## Brand attribution

This site is presented by Listerdale Life Sciences and links to:

- `https://listerdale.nl/`
