(function () {
  "use strict";

  // Configuration — auto-detect the server URL from the script src
  var API_BASE = document.currentScript
    ? document.currentScript.src.replace("/embed.js", "")
    : "";

  var WIDGET_ID = "listerdale-chat-widget";
  var W = "#" + WIDGET_ID;

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

    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0088cc !important;text-decoration:underline !important;font-weight:500 !important;">$1</a>'
    );
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    html = html.replace(
      /(?:^|\<br\>)[-•]\s+(.+?)(?=(?:\<br\>[-•]|\<\/p\>|$))/g,
      '<li style="margin:4px 0 4px 16px !important;padding:0 !important;list-style:disc;">$1</li>'
    );

    return "<p>" + html + "</p>";
  }

  // ─── Styles ───────────────────────────────────────────────────
  // Every rule is scoped under #listerdale-chat-widget for high
  // specificity so host-page CSS cannot override widget styles.
  var STYLES = `
    ${W} { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-size: 14px !important; line-height: 1.5 !important; color: #1e293b !important; -webkit-font-smoothing: antialiased; }

    /* ── Floating Button ── */
    ${W} .lsc-btn {
      all: unset !important;
      position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 99999 !important;
      display: flex !important; align-items: center !important; gap: 8px !important;
      padding: 14px 20px !important; border-radius: 50px !important;
      background: #1e293b !important; color: #ffffff !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 14px !important; font-weight: 500 !important; line-height: 1.5 !important;
      cursor: pointer !important; box-sizing: border-box !important;
      box-shadow: 0 8px 30px rgba(30,41,59,0.3) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    }
    ${W} .lsc-btn:hover { transform: scale(1.05) !important; box-shadow: 0 12px 40px rgba(30,41,59,0.4) !important; }
    ${W} .lsc-btn svg { width: 20px !important; height: 20px !important; display: block !important; fill: none !important; stroke: currentColor !important; }

    /* ── Chat Window ── */
    ${W} .lsc-window {
      all: unset !important;
      position: fixed !important; bottom: 0 !important; right: 0 !important; z-index: 99999 !important;
      width: 100% !important; height: 100% !important;
      display: flex !important; flex-direction: column !important;
      background: #ffffff !important; color: #1e293b !important;
      overflow: hidden !important; box-sizing: border-box !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 14px !important; line-height: 1.5 !important;
      box-shadow: 0 25px 60px rgba(0,0,0,0.15) !important;
      animation: lsc-slide-up 0.3s ease !important;
    }
    @media (min-width: 640px) {
      ${W} .lsc-window {
        bottom: 24px !important; right: 24px !important;
        width: 420px !important; height: 600px !important; max-height: 80vh !important;
        border-radius: 16px !important; border: 1px solid #e2e8f0 !important;
      }
    }
    @keyframes lsc-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Header ── */
    ${W} .lsc-header {
      display: flex !important; align-items: center !important; justify-content: space-between !important;
      padding: 14px 20px !important; background: #1e293b !important; color: #ffffff !important;
      flex-shrink: 0 !important; box-sizing: border-box !important; margin: 0 !important;
    }
    ${W} .lsc-header-left { display: flex !important; align-items: center !important; gap: 12px !important; margin: 0 !important; padding: 0 !important; }
    ${W} .lsc-header-icon {
      width: 36px !important; height: 36px !important; border-radius: 50% !important;
      background: rgba(255,255,255,0.15) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      margin: 0 !important; padding: 0 !important; flex-shrink: 0 !important;
    }
    ${W} .lsc-header-icon svg { width: 20px !important; height: 20px !important; display: block !important; fill: none !important; stroke: currentColor !important; }
    ${W} .lsc-header-title { font-size: 14px !important; font-weight: 600 !important; color: #ffffff !important; margin: 0 !important; padding: 0 !important; line-height: 1.4 !important; }
    ${W} .lsc-header-sub { font-size: 11px !important; opacity: 0.8 !important; color: #ffffff !important; margin: 0 !important; padding: 0 !important; line-height: 1.4 !important; }
    ${W} .lsc-header-actions { display: flex !important; gap: 4px !important; margin: 0 !important; padding: 0 !important; }
    ${W} .lsc-header-actions button {
      all: unset !important;
      background: transparent !important; color: #ffffff !important; cursor: pointer !important;
      padding: 8px !important; border-radius: 50% !important; box-sizing: border-box !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      transition: background 0.15s !important;
    }
    ${W} .lsc-header-actions button:hover { background: rgba(255,255,255,0.15) !important; }
    ${W} .lsc-header-actions button svg { width: 18px !important; height: 18px !important; display: block !important; fill: none !important; stroke: currentColor !important; }

    /* ── Messages Area ── */
    ${W} .lsc-messages {
      flex: 1 1 0% !important; overflow-y: auto !important; padding: 16px !important;
      display: flex !important; flex-direction: column !important; gap: 16px !important;
      margin: 0 !important; box-sizing: border-box !important; background: #ffffff !important;
    }

    /* ── Empty State ── */
    ${W} .lsc-empty {
      display: flex !important; flex-direction: column !important; align-items: center !important;
      justify-content: center !important; height: 100% !important; gap: 20px !important;
      padding: 8px !important; margin: 0 !important; box-sizing: border-box !important;
    }
    ${W} .lsc-empty-icon {
      width: 56px !important; height: 56px !important; border-radius: 50% !important;
      background: rgba(0,136,204,0.1) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      margin: 0 !important; padding: 0 !important;
    }
    ${W} .lsc-empty-icon svg { width: 28px !important; height: 28px !important; color: #0088cc !important; display: block !important; fill: none !important; stroke: currentColor !important; }
    ${W} .lsc-empty h4 { font-size: 16px !important; font-weight: 600 !important; color: #1e293b !important; text-align: center !important; margin: 0 !important; padding: 0 !important; line-height: 1.4 !important; font-family: inherit !important; }
    ${W} .lsc-empty p { font-size: 13px !important; color: #64748b !important; text-align: center !important; max-width: 280px !important; line-height: 1.6 !important; margin: 0 !important; padding: 0 !important; }

    /* ── Suggestions ── */
    ${W} .lsc-suggestions { width: 100% !important; display: flex !important; flex-direction: column !important; gap: 8px !important; margin: 0 !important; padding: 0 !important; }
    ${W} .lsc-suggestions-label { font-size: 11px !important; font-weight: 500 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; padding: 0 4px !important; margin: 0 !important; line-height: 1.5 !important; }
    ${W} .lsc-suggest-btn {
      all: unset !important;
      width: 100% !important; display: flex !important; align-items: center !important; justify-content: space-between !important;
      gap: 8px !important; padding: 10px 14px !important; border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important; background: #ffffff !important;
      cursor: pointer !important; font-size: 13px !important; color: #1e293b !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      transition: background 0.15s, border-color 0.15s !important;
      text-align: left !important; line-height: 1.5 !important; box-sizing: border-box !important;
    }
    ${W} .lsc-suggest-btn:hover { background: #f0f7ff !important; border-color: rgba(0,136,204,0.3) !important; }
    ${W} .lsc-suggest-btn svg { width: 14px !important; height: 14px !important; color: #94a3b8 !important; flex-shrink: 0 !important; display: block !important; fill: none !important; stroke: currentColor !important; }
    ${W} .lsc-suggest-btn:hover svg { color: #0088cc !important; }

    /* ── Messages ── */
    ${W} .lsc-msg { display: flex !important; gap: 10px !important; margin: 0 !important; padding: 0 !important; }
    ${W} .lsc-msg-user { justify-content: flex-end !important; }
    ${W} .lsc-msg-ai { justify-content: flex-start !important; }

    ${W} .lsc-msg-avatar {
      width: 28px !important; height: 28px !important; border-radius: 50% !important; flex-shrink: 0 !important; margin-top: 4px !important;
      background: rgba(0,136,204,0.1) !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      padding: 0 !important;
    }
    ${W} .lsc-msg-avatar svg { width: 14px !important; height: 14px !important; color: #0088cc !important; display: block !important; fill: none !important; stroke: currentColor !important; }

    ${W} .lsc-msg-bubble {
      max-width: 82% !important; padding: 10px 14px !important; font-size: 14px !important; line-height: 1.6 !important;
      margin: 0 !important; box-sizing: border-box !important;
    }
    ${W} .lsc-msg-user .lsc-msg-bubble {
      background: #1e293b !important; color: #ffffff !important;
      border-radius: 16px 16px 6px 16px !important; border: none !important;
    }
    ${W} .lsc-msg-ai .lsc-msg-bubble {
      background: #f8fafc !important; color: #1e293b !important;
      border-radius: 16px 16px 16px 6px !important; border: none !important;
    }
    ${W} .lsc-msg-ai .lsc-msg-bubble p { margin: 8px 0 !important; padding: 0 !important; font-size: 14px !important; line-height: 1.6 !important; }
    ${W} .lsc-msg-ai .lsc-msg-bubble p:first-child { margin-top: 0 !important; }
    ${W} .lsc-msg-ai .lsc-msg-bubble p:last-child { margin-bottom: 0 !important; }
    ${W} .lsc-msg-ai .lsc-msg-bubble a { color: #0088cc !important; text-decoration: underline !important; font-weight: 500 !important; }
    ${W} .lsc-msg-ai .lsc-msg-bubble strong { font-weight: 600 !important; }
    ${W} .lsc-msg-ai .lsc-msg-bubble li { margin: 4px 0 4px 16px !important; padding: 0 !important; }

    /* ── Typing Indicator ── */
    ${W} .lsc-typing { display: flex !important; gap: 6px !important; padding: 4px 0 !important; margin: 0 !important; }
    ${W} .lsc-typing-dot {
      width: 8px !important; height: 8px !important; border-radius: 50% !important;
      background: #94a3b8 !important; animation: lsc-bounce 1.4s infinite !important;
      margin: 0 !important; padding: 0 !important;
    }
    ${W} .lsc-typing-dot:nth-child(2) { animation-delay: 0.15s !important; }
    ${W} .lsc-typing-dot:nth-child(3) { animation-delay: 0.3s !important; }
    @keyframes lsc-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* ── Input Area ── */
    ${W} .lsc-input-area {
      padding: 12px 16px !important; border-top: 1px solid #e2e8f0 !important; background: #ffffff !important;
      flex-shrink: 0 !important; margin: 0 !important; box-sizing: border-box !important;
    }
    ${W} .lsc-input-form { display: flex !important; align-items: flex-end !important; gap: 8px !important; margin: 0 !important; padding: 0 !important; }
    ${W} .lsc-input-form textarea {
      all: unset !important;
      flex: 1 1 0% !important; resize: none !important;
      border: 1px solid #e2e8f0 !important; border-radius: 12px !important;
      padding: 10px 14px !important; font-size: 14px !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      min-height: 42px !important; max-height: 100px !important;
      line-height: 1.5 !important; background: #ffffff !important; color: #1e293b !important;
      box-sizing: border-box !important; display: block !important;
      transition: border-color 0.15s, box-shadow 0.15s !important;
    }
    ${W} .lsc-input-form textarea:focus { border-color: #0088cc !important; box-shadow: 0 0 0 3px rgba(0,136,204,0.1) !important; outline: none !important; }
    ${W} .lsc-input-form textarea::placeholder { color: #94a3b8 !important; }
    ${W} .lsc-send-btn {
      all: unset !important;
      flex-shrink: 0 !important; width: 40px !important; height: 40px !important; border-radius: 12px !important;
      background: #0088cc !important; color: #ffffff !important; cursor: pointer !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      box-sizing: border-box !important;
      transition: background 0.15s !important;
    }
    ${W} .lsc-send-btn:hover { background: #0077b3 !important; }
    ${W} .lsc-send-btn:disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
    ${W} .lsc-send-btn svg { width: 16px !important; height: 16px !important; display: block !important; fill: none !important; stroke: currentColor !important; }

    /* ── Footer ── */
    ${W} .lsc-footer { text-align: center !important; padding: 8px 0 2px !important; font-size: 10px !important; color: #94a3b8 !important; opacity: 0.6 !important; margin: 0 !important; }
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
  // Load Inter font if not already present
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    var fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(fontLink);
  }

  var style = document.createElement("style");
  style.textContent = STYLES;
  document.head.appendChild(style);

  var container = document.createElement("div");
  container.id = WIDGET_ID;
  document.body.appendChild(container);

  render();
})();
