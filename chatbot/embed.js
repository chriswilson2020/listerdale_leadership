(function () {
  "use strict";

  // Configuration — auto-detect the server URL from the script src
  var API_BASE = document.currentScript
    ? document.currentScript.src.replace("/embed.js", "")
    : "";

  var WIDGET_ID = "listerdale-chat-widget";

  // Prevent double-loading
  if (document.getElementById(WIDGET_ID)) return;

  // ─── Session Management ───────────────────────────────────────
  function generateSessionId() {
    return (
      "ls-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function getOrCreateSessionId() {
    var key = "listerdale-chat-session";
    var id = localStorage.getItem(key);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(key, id);
    }
    return id;
  }

  var sessionId = getOrCreateSessionId();
  var messages = [];
  var isOpen = false;
  var isLoading = false;

  // ─── API Call (simple REST) ──────────────────────────────────
  function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    messages.push({ role: "user", content: text.trim() });
    isLoading = true;
    render();

    fetch(API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.trim(), sessionId: sessionId }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        // Update sessionId if server returns one (first message)
        if (data.sessionId) {
          sessionId = data.sessionId;
          localStorage.setItem("listerdale-chat-session", sessionId);
        }
        var content = data.reply || "Sorry, I couldn't process that. Please try again.";
        messages.push({ role: "assistant", content: content });
        isLoading = false;
        render();
      })
      .catch(function () {
        messages.push({
          role: "assistant",
          content:
            "I'm having trouble connecting. Please visit [the leadership modules](https://listerdalestrategy.com/leadership/) directly.",
        });
        isLoading = false;
        render();
      });
  }

  // ─── Simple Markdown Rendering ────────────────────────────────
  function renderMarkdown(text) {
    var html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Links: [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0088cc;text-decoration:underline;font-weight:500;">$1</a>'
    );

    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Line breaks
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");

    // Bullet lists
    html = html.replace(
      /(?:^|\<br\>)[-•]\s+(.+?)(?=(?:\<br\>[-•]|\<\/p\>|$))/g,
      '<li style="margin:2px 0;margin-left:16px;list-style:disc;">$1</li>'
    );

    return "<p>" + html + "</p>";
  }

  // ─── Styles (Listerdale Color Scheme) ─────────────────────────
  var STYLES = `
    #${WIDGET_ID}, #${WIDGET_ID} * { box-sizing: border-box; margin: 0; padding: 0; border: 0; font: inherit; vertical-align: baseline; }
    #${WIDGET_ID} { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.5; color: #1e293b; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    #${WIDGET_ID} button { font-family: inherit; cursor: pointer; background: none; border: none; }
    #${WIDGET_ID} textarea { font-family: inherit; }
    #${WIDGET_ID} a { color: inherit; text-decoration: none; }
    #${WIDGET_ID} p, #${WIDGET_ID} h4, #${WIDGET_ID} li, #${WIDGET_ID} span, #${WIDGET_ID} div { margin: 0; padding: 0; }

    .lsc-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px; border-radius: 50px; border: none !important;
      background: #1e293b; color: white; font-size: 14px; font-weight: 500;
      cursor: pointer; box-shadow: 0 8px 30px rgba(30,41,59,0.3);
      transition: all 0.2s ease; line-height: 1.5;
    }
    .lsc-btn:hover { transform: scale(1.05); box-shadow: 0 12px 40px rgba(30,41,59,0.4); }
    .lsc-btn svg { width: 20px; height: 20px; }

    .lsc-window {
      position: fixed; bottom: 0; right: 0; z-index: 99999;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: white; overflow: hidden; color: #1e293b;
      box-shadow: 0 25px 60px rgba(0,0,0,0.15);
      animation: lsc-slide-up 0.3s ease;
    }
    @media (min-width: 640px) {
      .lsc-window {
        bottom: 24px; right: 24px;
        width: 420px; height: 600px; max-height: 80vh;
        border-radius: 16px; border: 1px solid #e2e8f0 !important;
      }
    }
    @keyframes lsc-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .lsc-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; background: #1e293b; color: white;
      flex-shrink: 0;
    }
    .lsc-header-left { display: flex; align-items: center; gap: 12px; }
    .lsc-header-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .lsc-header-icon svg { width: 20px; height: 20px; }
    .lsc-header-title { font-size: 14px; font-weight: 600; }
    .lsc-header-sub { font-size: 11px; opacity: 0.8; }
    .lsc-header-actions { display: flex; gap: 4px; }
    .lsc-header-actions button {
      background: transparent; border: none !important; color: white; cursor: pointer;
      padding: 8px; border-radius: 50%; transition: background 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .lsc-header-actions button:hover { background: rgba(255,255,255,0.15); }
    .lsc-header-actions button svg { width: 18px; height: 18px; }

    .lsc-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 16px;
    }

    .lsc-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: 20px; padding: 8px;
    }
    .lsc-empty-icon {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(0,136,204,0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .lsc-empty-icon svg { width: 28px; height: 28px; color: #0088cc; }
    .lsc-empty h4 { font-size: 16px; font-weight: 600; color: #1e293b; text-align: center; }
    .lsc-empty p { font-size: 13px; color: #64748b; text-align: center; max-width: 280px; line-height: 1.6; }

    .lsc-suggestions { width: 100%; display: flex; flex-direction: column; gap: 8px; }
    .lsc-suggestions-label { font-size: 11px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 4px; }
    .lsc-suggest-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      gap: 8px; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0 !important;
      background: white; cursor: pointer; font-size: 13px; color: #1e293b;
      transition: all 0.15s; text-align: left; line-height: 1.5;
    }
    .lsc-suggest-btn:hover { background: #f0f7ff; border-color: rgba(0,136,204,0.3) !important; }
    .lsc-suggest-btn svg { width: 14px; height: 14px; color: #94a3b8; flex-shrink: 0; }
    .lsc-suggest-btn:hover svg { color: #0088cc; }

    .lsc-msg { display: flex; gap: 10px; }
    .lsc-msg-user { justify-content: flex-end; }
    .lsc-msg-ai { justify-content: flex-start; }

    .lsc-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
      background: rgba(0,136,204,0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .lsc-msg-avatar svg { width: 14px; height: 14px; color: #0088cc; }

    .lsc-msg-bubble {
      max-width: 82%; padding: 10px 14px; font-size: 14px; line-height: 1.6;
    }
    .lsc-msg-user .lsc-msg-bubble {
      background: #1e293b; color: white;
      border-radius: 16px 16px 6px 16px;
      border: none !important;
    }
    .lsc-msg-ai .lsc-msg-bubble {
      background: #f8fafc; color: #1e293b;
      border-radius: 16px 16px 16px 6px;
      border: none !important;
    }
    .lsc-msg-ai .lsc-msg-bubble p { margin: 8px 0; }
    .lsc-msg-ai .lsc-msg-bubble p:first-child { margin-top: 0; }
    .lsc-msg-ai .lsc-msg-bubble p:last-child { margin-bottom: 0; }
    .lsc-msg-ai .lsc-msg-bubble a { color: #0088cc; text-decoration: underline; font-weight: 500; }
    .lsc-msg-ai .lsc-msg-bubble strong { font-weight: 600; }
    .lsc-msg-ai .lsc-msg-bubble li { margin-left: 16px; margin-top: 4px; margin-bottom: 4px; }

    .lsc-typing { display: flex; gap: 6px; padding: 4px 0; }
    .lsc-typing-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #94a3b8; animation: lsc-bounce 1.4s infinite;
    }
    .lsc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .lsc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes lsc-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .lsc-input-area {
      padding: 12px 16px; border-top: 1px solid #e2e8f0 !important; background: white;
      flex-shrink: 0;
    }
    .lsc-input-form { display: flex; align-items: flex-end; gap: 8px; }
    .lsc-input-form textarea {
      flex: 1; resize: none; border: 1px solid #e2e8f0 !important; border-radius: 12px;
      padding: 10px 14px; font-size: 14px; font-family: inherit;
      min-height: 42px; max-height: 100px; outline: none; line-height: 1.5;
      transition: border-color 0.15s, box-shadow 0.15s; background: white; color: #1e293b;
    }
    .lsc-input-form textarea:focus { border-color: #0088cc !important; box-shadow: 0 0 0 3px rgba(0,136,204,0.1); }
    .lsc-input-form textarea::placeholder { color: #94a3b8; }
    .lsc-send-btn {
      flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px;
      background: #0088cc !important; color: white; border: none !important; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .lsc-send-btn:hover { background: #0077b3 !important; }
    .lsc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .lsc-send-btn svg { width: 16px; height: 16px; }

    .lsc-footer { text-align: center; padding: 8px 0 2px; font-size: 10px; color: #94a3b8; opacity: 0.6; }
  `;

  // ─── SVG Icons ────────────────────────────────────────────────
  var ICONS = {
    chat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>',
    sparkles:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    close:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    reset:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  };

  var SUGGESTIONS = [
    "Someone on my team is underperforming",
    "I'm drowning in decisions and tasks",
    "How do I give better feedback?",
    "Help me delegate more effectively",
    "There's conflict on my team",
  ];

  // ─── Render ───────────────────────────────────────────────────
  function render() {
    var container = document.getElementById(WIDGET_ID);
    if (!container) return;

    var html = "";

    if (!isOpen) {
      html =
        '<button class="lsc-btn" onclick="window.__lsc_open()">' +
        ICONS.chat +
        '<span style="display:none" class="lsc-btn-text">Ask a leadership question</span>' +
        "</button>";
    } else {
      html = '<div class="lsc-window">';

      // Header
      html += '<div class="lsc-header">';
      html += '<div class="lsc-header-left">';
      html += '<div class="lsc-header-icon">' + ICONS.sparkles + "</div>";
      html += "<div>";
      html += '<div class="lsc-header-title">Leadership Guide</div>';
      html += '<div class="lsc-header-sub">Powered by Listerdale Strategy</div>';
      html += "</div></div>";
      html += '<div class="lsc-header-actions">';
      html +=
        '<button onclick="window.__lsc_new()" title="New conversation">' +
        ICONS.reset +
        "</button>";
      html +=
        '<button onclick="window.__lsc_close()">' + ICONS.close + "</button>";
      html += "</div></div>";

      // Messages
      html += '<div class="lsc-messages" id="lsc-messages">';

      if (messages.length === 0 && !isLoading) {
        html += '<div class="lsc-empty">';
        html += '<div style="text-align:center">';
        html += '<div class="lsc-empty-icon" style="margin:0 auto">' + ICONS.sparkles + "</div>";
        html += "<h4 style='margin-top:12px'>Welcome to the Leadership Guide</h4>";
        html +=
          "<p>Ask me anything about leadership, or describe a challenge you're facing.</p>";
        html += "</div>";
        html += '<div class="lsc-suggestions">';
        html += '<div class="lsc-suggestions-label">Common questions</div>';
        for (var i = 0; i < SUGGESTIONS.length; i++) {
          html +=
            '<button class="lsc-suggest-btn" onclick="window.__lsc_send(\'' +
            SUGGESTIONS[i].replace(/'/g, "\\'") +
            "')\">" +
            "<span>" +
            SUGGESTIONS[i] +
            "</span>" +
            ICONS.arrow +
            "</button>";
        }
        html += "</div></div>";
      } else {
        for (var j = 0; j < messages.length; j++) {
          var msg = messages[j];
          if (msg.role === "user") {
            html += '<div class="lsc-msg lsc-msg-user">';
            html +=
              '<div class="lsc-msg-bubble">' +
              msg.content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;") +
              "</div>";
            html += "</div>";
          } else {
            html += '<div class="lsc-msg lsc-msg-ai">';
            html +=
              '<div class="lsc-msg-avatar">' + ICONS.sparkles + "</div>";
            html +=
              '<div class="lsc-msg-bubble">' +
              renderMarkdown(msg.content) +
              "</div>";
            html += "</div>";
          }
        }

        if (isLoading) {
          html += '<div class="lsc-msg lsc-msg-ai">';
          html += '<div class="lsc-msg-avatar">' + ICONS.sparkles + "</div>";
          html += '<div class="lsc-msg-bubble">';
          html += '<div class="lsc-typing">';
          html += '<div class="lsc-typing-dot"></div>';
          html += '<div class="lsc-typing-dot"></div>';
          html += '<div class="lsc-typing-dot"></div>';
          html += "</div></div></div>";
        }
      }

      html += "</div>";

      // Input
      html += '<div class="lsc-input-area">';
      html += '<form class="lsc-input-form" onsubmit="event.preventDefault();window.__lsc_submit()">';
      html +=
        '<textarea id="lsc-input" placeholder="Ask about leadership..." rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();window.__lsc_submit()}"></textarea>';
      html +=
        '<button type="submit" class="lsc-send-btn" id="lsc-send">' +
        ICONS.send +
        "</button>";
      html += "</form>";
      html +=
        '<div class="lsc-footer">AI-powered guidance based on Listerdale leadership frameworks</div>';
      html += "</div>";

      html += "</div>";
    }

    container.innerHTML = html;

    // Show button text on wider screens
    if (!isOpen) {
      var btnText = container.querySelector(".lsc-btn-text");
      if (btnText && window.innerWidth >= 640) {
        btnText.style.display = "inline";
      }
    }

    // Scroll to bottom
    if (isOpen) {
      var msgContainer = document.getElementById("lsc-messages");
      if (msgContainer) {
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
      // Focus input
      var inp = document.getElementById("lsc-input");
      if (inp) setTimeout(function () { inp.focus(); }, 50);
    }
  }

  // ─── Global Handlers ──────────────────────────────────────────
  window.__lsc_open = function () {
    isOpen = true;
    render();
  };

  window.__lsc_close = function () {
    isOpen = false;
    render();
  };

  window.__lsc_send = function (text) {
    sendMessage(text);
  };

  window.__lsc_submit = function () {
    var inp = document.getElementById("lsc-input");
    if (inp && inp.value.trim()) {
      sendMessage(inp.value);
    }
  };

  window.__lsc_new = function () {
    var key = "listerdale-chat-session";
    sessionId = generateSessionId();
    localStorage.setItem(key, sessionId);
    messages = [];
    render();
  };

  // ─── Initialize ───────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = STYLES;
  document.head.appendChild(style);

  var container = document.createElement("div");
  container.id = WIDGET_ID;
  document.body.appendChild(container);

  render();
})();
