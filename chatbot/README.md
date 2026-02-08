# Listerdale Leadership Chatbot

An AI-powered chatbot that helps visitors navigate the 26 leadership modules on the Listerdale Strategy website. It understands leadership questions, provides contextual answers, and directs users to the appropriate module pages.

## Architecture

```
chatbot/
├── server.js          # Express server (API + static file serving)
├── knowledge-base.js  # Builds the LLM system prompt from module data
├── modules.json       # All 26 leadership modules (titles, URLs, content, keywords)
├── embed.js           # Self-contained chat widget (injected via <script> tag)
├── package.json       # Dependencies
├── .env.example       # Configuration template
├── .gitignore         # Ignores node_modules, .env, chat.db
└── README.md          # This file
```

## How It Works

1. **embed.js** is loaded on your website via a `<script>` tag. It renders a floating chat button in the bottom-right corner.
2. When a user sends a message, the widget calls `POST /api/chat` on your chatbot server.
3. **server.js** receives the message, loads conversation history from SQLite, and sends everything to OpenAI with a system prompt containing all 26 module summaries.
4. The LLM responds with leadership advice and clickable links to relevant module pages.
5. Conversation history is stored in a local SQLite file (`chat.db`) so users maintain context across multiple messages.

## Quick Start

### 1. Install dependencies

```bash
cd chatbot
npm install
```

### 2. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Start the server

```bash
npm start
```

The server will start on port 3001 (configurable via `PORT` in `.env`).

### 4. Verify it's working

Open http://localhost:3001/api/health in your browser. You should see:

```json
{
  "status": "ok",
  "modules": 26,
  "model": "gpt-4o-mini"
}
```

## Embedding on Your Website

Add this script tag before the closing `</body>` tag on any page:

```html
<script src="https://your-server-domain.com/embed.js" async></script>
```

Replace `your-server-domain.com` with wherever you deploy the chatbot server.

For local development, use:

```html
<script src="http://localhost:3001/embed.js" async></script>
```

The widget will automatically appear as a floating chat button in the bottom-right corner.

## Configuration

All configuration is done via the `.env` file:

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes | — | Your OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model to use |
| `PORT` | No | `3001` | Server port |
| `ALLOWED_ORIGINS` | No | `*` | CORS origins (comma-separated) |

### Model Options

- **`gpt-4o-mini`** (default) — Fast, cheap (~$0.15/M input tokens), great for this use case
- **`gpt-4o`** — Better reasoning, more expensive (~$2.50/M input tokens)
- **`gpt-3.5-turbo`** — Cheapest option, slightly lower quality

## Cost Estimates

Each user message costs approximately:

| Model | Cost per message | 100 users/day (5 msgs each) |
|---|---|---|
| gpt-4o-mini | ~$0.001 | ~$3/month |
| gpt-4o | ~$0.01 | ~$30/month |
| gpt-3.5-turbo | ~$0.0005 | ~$1.50/month |

## Deployment Options

### Option A: VPS (e.g., DigitalOcean, Hetzner)

```bash
# On your server
git clone <your-repo-url>
cd listerdale_leadership/chatbot
npm install
cp .env.example .env
# Edit .env with your API key
# Use pm2 to keep it running:
npm install -g pm2
pm2 start server.js --name listerdale-chatbot
pm2 save
pm2 startup
```

### Option B: Railway / Render

1. Connect your GitHub repo
2. Set the root directory to `chatbot/`
3. Add `OPENAI_API_KEY` as an environment variable
4. Deploy — it will auto-detect the `npm start` script

### Option C: Run alongside your static site

If your static site is served by nginx, add a reverse proxy:

```nginx
location /chatbot/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Then update the embed script to:

```html
<script src="/chatbot/embed.js" async></script>
```

## Production Checklist

- [ ] Set `OPENAI_API_KEY` in `.env`
- [ ] Set `ALLOWED_ORIGINS` to your actual domain (e.g., `https://listerdalestrategy.com`)
- [ ] Update the `<script src="...">` in `index.html` to point to your production URL
- [ ] Use a process manager (pm2) or container to keep the server running
- [ ] Set up HTTPS (via nginx/Caddy reverse proxy or hosting platform)
- [ ] Monitor the `chat.db` file size if you expect high traffic

## Updating the Knowledge Base

To update module content, edit `modules.json`. Each module has this structure:

```json
{
  "slug": "start-with-why",
  "title": "Simon Sinek's Start With Why",
  "description": "Brief description",
  "section": "Foundations: Purpose, Authority & Context",
  "url": "https://listerdalestrategy.com/leadership/modules/start-with-why.html",
  "content": "Full page content...",
  "headings": ["Heading 1", "Heading 2"],
  "key_points": ["Point 1", "Point 2"]
}
```

After editing, restart the server for changes to take effect.

## API Reference

### `GET /api/health`

Returns server status and configuration.

### `POST /api/chat`

Send a message and get an AI response.

**Request:**
```json
{
  "message": "How do I give better feedback?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "Great question! The **How to Give Feedback** module covers...",
  "sessionId": "uuid-of-the-session"
}
```

## License

Part of the Listerdale Leadership project.
