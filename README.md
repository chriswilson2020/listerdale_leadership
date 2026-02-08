# listerdale_leadership

Interactive Leadership Guide — a static, single-page web application that presents 26 leadership modules as a visual, card-based hub with a built-in diagnostic tool.

## Features

- 26 leadership module cards organized into 9 thematic sections on a single page.
- Individual module pages under `modules/*.html`.
- 60-second modal diagnostic that asks branching questions and returns a recommended module sequence.
- Embedded module reading mode in the diagnostic via iframe.
- Consistent visual system using shared styles in `css/styles.css`.
- Responsive layout optimized for desktop, tablet, and mobile.
- PWA/web-app metadata and favicon assets (`site.webmanifest`, touch icons, favicons).
- **AI-powered leadership chatbot** — see [chatbot/README.md](chatbot/README.md).

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (IIFE pattern, no dependencies)
- Google Fonts (`Space Grotesk`, `Inter`)
- Node.js / Express / OpenAI (chatbot only)

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
├── chatbot/                    # AI leadership chatbot (Express + OpenAI + SQLite)
│   ├── server.js               # Chat API server
│   ├── embed.js                # Embeddable chat widget
│   ├── knowledge-base.js       # System prompt builder
│   ├── modules.json            # 26 module data
│   ├── package.json            # Dependencies
│   ├── .env.example            # Configuration template
│   └── README.md               # Chatbot setup instructions
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

## Chatbot

The `chatbot/` directory contains a standalone AI chatbot that helps visitors navigate the leadership modules. It uses OpenAI and runs as a simple Node.js server.

### Quick Start

```bash
cd chatbot
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm start
```

See [chatbot/README.md](chatbot/README.md) for full deployment instructions, cost estimates, and configuration options.

## Run locally

Because this is a static site, you can run it with any local HTTP server.

```bash
# from project root
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

Notes:
- Opening files directly with `file://` can break some browser behaviors; use an HTTP server.
- The diagnostic module embeds pages via iframe, which also works best over HTTP.

## How the diagnostic works

The diagnostic logic lives in `js/diagnostic.js`:

- `tree` defines the question graph and branching options.
- `results` defines outcome cards, module paths, and reality-check guidance.
- UI is mounted dynamically into the page as a modal overlay.
- A trigger button with `id="diagnostic-trigger"` in `index.html` opens the flow.

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

Deployment artifact is the repository root as-is (no build step required). The chatbot requires a Node.js server — see [chatbot/README.md](chatbot/README.md) for deployment options.

## Brand attribution

This site is presented by Listerdale Life Sciences and links to:
- `https://listerdale.nl/`
