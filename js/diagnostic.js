// Interactive Leadership Diagnostic - Decision Tree with Guided Reading
(function() {
  'use strict';

  // Decision tree structure
  const tree = {
    q1: {
      question: "What's the main pressure you're feeling?",
      options: [
        { label: "\ud83d\udc64 People \u2014 someone (or the team) isn't working", next: "q2_people" },
        { label: "\ud83d\udccb Workload \u2014 too much to do, too many decisions", next: "q2_workload" },
        { label: "\ud83e\udded Direction \u2014 something feels off but I can't name it", next: "q2_direction" }
      ]
    },
    q2_people: {
      question: "Is this about one person, or the team as a whole?",
      options: [
        { label: "One person \u2014 they're underperforming or causing problems", next: "q3_one_person" },
        { label: "The team \u2014 trust is low, there's tension, or we're stuck", next: "r_team_dynamics" },
        { label: "Honestly, it might be me", next: "r_self_leadership" }
      ]
    },
    q3_one_person: {
      question: "Have you had a direct, specific conversation about this yet?",
      options: [
        { label: "No \u2014 I've been putting it off", next: "r_feedback_first" },
        { label: "Yes, but nothing changed", next: "r_escalate" },
        { label: "Yes, and I think it's time to let them go", next: "r_letting_go" }
      ]
    },
    q2_workload: {
      question: "What's the root of the overload?",
      options: [
        { label: "I can't let go \u2014 I keep doing things myself", next: "r_delegation" },
        { label: "Everything feels urgent \u2014 I can't prioritise", next: "r_prioritisation" },
        { label: "Too many decisions land on my desk", next: "r_decisions" }
      ]
    },
    q2_direction: {
      question: "If you had to guess, where does the unease sit?",
      options: [
        { label: "The team has lost energy \u2014 they're going through the motions", next: "r_motivation" },
        { label: "I'm not sure my leadership style fits what's needed right now", next: "r_situational" },
        { label: "We've lost sight of why we're doing this", next: "r_purpose" }
      ]
    }
  };

  // Results
  const results = {
    r_feedback_first: {
      title: "Start with the conversation",
      summary: "You can't fix what you haven't named. The first step is giving clear, specific feedback.",
      path: [
        { name: "How to Give Feedback", url: "modules/give-feedback.html", why: "Learn the preparation-delivery-discussion-followup framework" },
        { name: "How to Coach Your Team", url: "modules/coach-your-team.html", why: "If it's a skill gap, shift into coaching mode" },
        { name: "Accountability", url: "modules/accountability.html", why: "If coaching doesn't work, build ownership with the Oz Principle" }
      ],
      reality: "If nothing changes after clear feedback and coaching, that's information \u2014 not failure."
    },
    r_escalate: {
      title: "Time to raise the stakes",
      summary: "You've had the conversation. It didn't land. Now you need to decide: coach harder, restructure, or move on.",
      path: [
        { name: "Accountability", url: "modules/accountability.html", why: "Move from 'Below the Line' blame to 'Above the Line' ownership" },
        { name: "How to Talk to a Problem Employee", url: "modules/problem-employee.html", why: "Have the direct conversation with clear consequences" },
        { name: "The Uncomfortable Truths", url: "modules/uncomfortable-truths.html", why: "Face the hard reality: not every person is fixable in every role" }
      ],
      reality: "The most common mistake here is waiting too long. Your team already knows."
    },
    r_letting_go: {
      title: "Do the due diligence, then decide",
      summary: "If you're here, you probably already know the answer. Make sure you've done the work to act fairly.",
      path: [
        { name: "20 Questions Before Firing", url: "modules/20-questions-firing.html", why: "Work through the full checklist before making the call" },
        { name: "How to Talk to a Problem Employee", url: "modules/problem-employee.html", why: "One final, clear conversation with documented expectations" },
        { name: "The Uncomfortable Truths", url: "modules/uncomfortable-truths.html", why: "The cost of inaction is invisible \u2014 until it isn't" }
      ],
      reality: "Delaying is not kindness. It's avoidance. The rest of your team is watching."
    },
    r_team_dynamics: {
      title: "Fix the foundation, not the symptoms",
      summary: "Team dysfunction usually starts at the bottom of Lencioni's pyramid: trust.",
      path: [
        { name: "5 Dysfunctions of a Team", url: "modules/5-dysfunctions.html", why: "Diagnose which layer of the pyramid is broken" },
        { name: "Conflict Resolution", url: "modules/conflict-resolution.html", why: "Address the specific tensions with a structured approach" },
        { name: "4C's Communication", url: "modules/4cs-communication.html", why: "Build better norms for how your team disagrees" }
      ],
      reality: "Some teams can't be saved \u2014 not because of bad people, but because of bad composition."
    },
    r_self_leadership: {
      title: "Start with the mirror",
      summary: "The hardest leadership work isn't building systems \u2014 it's seeing yourself clearly.",
      path: [
        { name: "The Uncomfortable Truths", url: "modules/uncomfortable-truths.html", why: "Truth #7: You are the constraint you can't see" },
        { name: "Situational Leadership", url: "modules/situational-leadership.html", why: "Is your style mismatched to what the team needs right now?" },
        { name: "How to Be a Less Stressed CEO", url: "modules/less-stressed-ceo.html", why: "Check your own state before diagnosing the team" }
      ],
      reality: "Ask your most trusted colleague: 'What's the one thing I do that holds this team back?'"
    },
    r_delegation: {
      title: "Let go to level up",
      summary: "If you're doing work that others could do, you're not leading \u2014 you're bottlenecking.",
      path: [
        { name: "Delegation for Founders", url: "modules/delegation-founders.html", why: "Learn to delegate outcomes, not just tasks" },
        { name: "Situational Leadership", url: "modules/situational-leadership.html", why: "Match your delegation style to each person's readiness" },
        { name: "Authority & Power", url: "modules/authority-power.html", why: "Understand what authority you're holding onto and why" }
      ],
      reality: "The voice saying 'it's faster if I do it myself' is the voice that keeps you stuck."
    },
    r_prioritisation: {
      title: "Stop doing the wrong things well",
      summary: "The problem isn't time management \u2014 it's that you haven't made the trade-offs explicit.",
      path: [
        { name: "Prioritisation & Trade-offs", url: "modules/prioritisation.html", why: "Use the Eisenhower Matrix to sort what actually matters" },
        { name: "Decision-Making", url: "modules/decision-making.html", why: "Use RAPID\u00ae to clarify who decides what" },
        { name: "How to Take Better Breaks", url: "modules/better-breaks.html", why: "You can't prioritise clearly when you're running on empty" }
      ],
      reality: "If everything is urgent, nothing is. The courage is in choosing what not to do."
    },
    r_decisions: {
      title: "Push decisions down",
      summary: "If too many decisions land on your desk, the problem isn't the decisions \u2014 it's the system.",
      path: [
        { name: "Decision-Making", url: "modules/decision-making.html", why: "RAPID\u00ae framework: who recommends, who decides, who executes" },
        { name: "Delegation for Founders", url: "modules/delegation-founders.html", why: "Give people the 'what' and 'why,' let them own the 'how'" },
        { name: "Authority & Power", url: "modules/authority-power.html", why: "Understand the five bases of power and where to distribute them" }
      ],
      reality: "One-way doors deserve deliberation. Two-way doors should be made fast."
    },
    r_motivation: {
      title: "Reconnect the wiring",
      summary: "When people go through the motions, the connection between work and meaning has eroded.",
      path: [
        { name: "The Psychology of Motivation", url: "modules/psychology-motivation.html", why: "Check autonomy, competence, and relatedness" },
        { name: "Start With Why", url: "modules/start-with-why.html", why: "When did you last talk about why the work matters?" },
        { name: "Coaching Questions", url: "modules/coaching-questions.html", why: "Use 'What's the real challenge here for you?' to surface what's hidden" }
      ],
      reality: "Sometimes the energy is gone because the work has genuinely changed."
    },
    r_situational: {
      title: "Recalibrate your style",
      summary: "The 'off' feeling often means your default style no longer fits the situation.",
      path: [
        { name: "Situational Leadership", url: "modules/situational-leadership.html", why: "Re-diagnose each person's readiness level (R1-R4)" },
        { name: "Leadership Stages", url: "modules/leadership-stages.html", why: "Has your business stage changed?" },
        { name: "Growth Stage", url: "modules/growth-stage.html", why: "Start-up, scale-up, or grown-up \u2014 each demands a different leader" }
      ],
      reality: "The leadership style that built the team may not be the style that grows it."
    },
    r_purpose: {
      title: "Go back to the beginning",
      summary: "If you've lost the 'why,' your team has too.",
      path: [
        { name: "Start With Why", url: "modules/start-with-why.html", why: "Reconnect with the Golden Circle: Why \u2192 How \u2192 What" },
        { name: "The Psychology of Motivation", url: "modules/psychology-motivation.html", why: "Intrinsic motivation drives long-term engagement" },
        { name: "Stakeholder Management", url: "modules/stakeholder-management.html", why: "Re-map who you're serving and what they actually need" }
      ],
      reality: "If you can't articulate the 'why' in one sentence that makes someone lean forward, you don't have one yet."
    }
  };

  // State
  let currentNode = null;
  let answers = [];
  let currentResult = null;
  let currentReadingStep = -1; // -1 = result overview, 0+ = reading a module
  let mode = 'questions'; // 'questions', 'result', 'reading'

  // DOM references
  let overlay, modal, questionArea, resultEl, readingArea, progressEl, backBtn;

  function init() {
    overlay = document.createElement('div');
    overlay.className = 'diag-overlay';
    overlay.innerHTML = `
      <div class="diag-modal">
        <button class="diag-close" aria-label="Close">&times;</button>
        <div class="diag-progress"></div>
        <div class="diag-body">
          <div class="diag-question-area">
            <div class="diag-step-label"></div>
            <h2 class="diag-question"></h2>
            <div class="diag-options"></div>
            <button class="diag-back" style="display:none;">\u2190 Back</button>
          </div>
          <div class="diag-result" style="display:none;"></div>
          <div class="diag-reading" style="display:none;">
            <div class="diag-reading-nav"></div>
            <div class="diag-reading-frame-wrapper">
              <div class="diag-reading-loader">Loading module...</div>
              <iframe class="diag-reading-frame" frameborder="0"></iframe>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    questionArea = overlay.querySelector('.diag-question-area');
    resultEl = overlay.querySelector('.diag-result');
    readingArea = overlay.querySelector('.diag-reading');
    progressEl = overlay.querySelector('.diag-progress');
    backBtn = overlay.querySelector('.diag-back');

    overlay.querySelector('.diag-close').addEventListener('click', close);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) close();
    });
    backBtn.addEventListener('click', goBack);

    // Handle iframe load
    var iframe = overlay.querySelector('.diag-reading-frame');
    iframe.addEventListener('load', function() {
      overlay.querySelector('.diag-reading-loader').style.display = 'none';
      iframe.style.opacity = '1';
    });

    var triggerBtn = document.getElementById('diagnostic-trigger');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', open);
    }
  }

  function open() {
    answers = [];
    currentNode = 'q1';
    currentResult = null;
    currentReadingStep = -1;
    mode = 'questions';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderQuestion();
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    // Clear iframe
    var iframe = overlay.querySelector('.diag-reading-frame');
    if (iframe) iframe.src = 'about:blank';
  }

  function showArea(which) {
    questionArea.style.display = which === 'questions' ? '' : 'none';
    resultEl.style.display = which === 'result' ? '' : 'none';
    readingArea.style.display = which === 'reading' ? '' : 'none';

    // Adjust modal size for reading mode
    if (which === 'reading') {
      modal = overlay.querySelector('.diag-modal');
      modal.classList.add('diag-modal-reading');
    } else {
      modal = overlay.querySelector('.diag-modal');
      modal.classList.remove('diag-modal-reading');
    }
  }

  function renderProgress() {
    progressEl.innerHTML = '';
    if (mode === 'questions') {
      var step = answers.length + 1;
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('div');
        dot.className = 'diag-progress-dot' + (i < step ? ' active' : '');
        progressEl.appendChild(dot);
      }
    } else if (mode === 'result' || mode === 'reading') {
      // Show reading path progress
      if (!currentResult) return;
      var path = currentResult.path;
      for (var j = 0; j < path.length; j++) {
        var pip = document.createElement('div');
        pip.className = 'diag-progress-dot';
        if (mode === 'reading' && j < currentReadingStep) pip.className += ' done';
        if (mode === 'reading' && j === currentReadingStep) pip.className += ' active';
        if (mode === 'result') pip.className += ''; // neutral
        progressEl.appendChild(pip);
      }
    }
  }

  function renderQuestion() {
    mode = 'questions';
    showArea('questions');

    var node = tree[currentNode];
    if (!node) return;

    var step = answers.length + 1;
    overlay.querySelector('.diag-step-label').textContent = 'Question ' + step + ' of 3';

    renderProgress();

    overlay.querySelector('.diag-question').textContent = node.question;

    var optionsEl = overlay.querySelector('.diag-options');
    optionsEl.innerHTML = '';
    node.options.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'diag-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', function() {
        selectOption(opt);
      });
      optionsEl.appendChild(btn);
    });

    backBtn.style.display = answers.length > 0 ? '' : 'none';
  }

  function selectOption(opt) {
    answers.push({ node: currentNode, option: opt });
    if (opt.next.startsWith('r_')) {
      currentResult = results[opt.next];
      renderResult();
    } else {
      currentNode = opt.next;
      renderQuestion();
    }
  }

  function goBack() {
    if (answers.length === 0) return;
    var prev = answers.pop();
    currentNode = prev.node;
    renderQuestion();
  }

  function renderResult() {
    mode = 'result';
    showArea('result');
    renderProgress();

    var r = currentResult;
    var html = '';
    html += '<div class="diag-result-header">';
    html += '<div class="diag-result-icon">\ud83c\udfaf</div>';
    html += '<h2 class="diag-result-title">' + r.title + '</h2>';
    html += '</div>';
    html += '<p class="diag-result-summary">' + r.summary + '</p>';

    html += '<div class="diag-result-path">';
    html += '<div class="diag-result-path-label">Your reading path \u2014 click any step to read it here</div>';
    r.path.forEach(function(step, i) {
      html += '<div class="diag-result-step" data-step="' + i + '">';
      html += '<div class="diag-result-step-num">' + (i + 1) + '</div>';
      html += '<div class="diag-result-step-content">';
      html += '<div class="diag-result-step-name">' + step.name + '</div>';
      html += '<div class="diag-result-step-why">' + step.why + '</div>';
      html += '</div>';
      html += '<div class="diag-result-step-arrow">\u2192</div>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="diag-result-reality">';
    html += '<strong>Reality check:</strong> ' + r.reality;
    html += '</div>';

    html += '<div class="diag-result-actions">';
    html += '<button class="diag-btn-start-reading">Start reading path</button>';
    html += '<button class="diag-restart-alt" id="diag-restart-btn">Start over</button>';
    html += '</div>';

    resultEl.innerHTML = html;

    // Bind step clicks
    resultEl.querySelectorAll('.diag-result-step').forEach(function(el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function() {
        var stepIdx = parseInt(el.getAttribute('data-step'));
        openReading(stepIdx);
      });
    });

    // Start reading button
    resultEl.querySelector('.diag-btn-start-reading').addEventListener('click', function() {
      openReading(0);
    });

    // Restart
    document.getElementById('diag-restart-btn').addEventListener('click', function() {
      answers = [];
      currentNode = 'q1';
      currentResult = null;
      currentReadingStep = -1;
      renderQuestion();
    });
  }

  function openReading(stepIdx) {
    mode = 'reading';
    currentReadingStep = stepIdx;
    showArea('reading');
    renderProgress();
    renderReadingNav();
    loadModule(currentResult.path[stepIdx].url);
  }

  function renderReadingNav() {
    var nav = overlay.querySelector('.diag-reading-nav');
    var path = currentResult.path;
    var html = '';

    html += '<button class="diag-reading-back-btn">\u2190 Back to results</button>';
    html += '<div class="diag-reading-steps">';
    path.forEach(function(step, i) {
      var cls = 'diag-reading-step-pill';
      if (i === currentReadingStep) cls += ' active';
      if (i < currentReadingStep) cls += ' done';
      html += '<button class="' + cls + '" data-step="' + i + '">';
      html += '<span class="pill-num">' + (i + 1) + '</span>';
      html += '<span class="pill-name">' + step.name + '</span>';
      html += '</button>';
    });
    html += '</div>';

    // Prev / Next buttons
    html += '<div class="diag-reading-arrows">';
    if (currentReadingStep > 0) {
      html += '<button class="diag-reading-prev">\u2190 Previous</button>';
    }
    if (currentReadingStep < path.length - 1) {
      html += '<button class="diag-reading-next">Next: ' + path[currentReadingStep + 1].name + ' \u2192</button>';
    } else {
      html += '<button class="diag-reading-done">\u2713 Done \u2014 close diagnostic</button>';
    }
    html += '</div>';

    nav.innerHTML = html;

    // Bind events
    nav.querySelector('.diag-reading-back-btn').addEventListener('click', function() {
      renderResult();
    });

    nav.querySelectorAll('.diag-reading-step-pill').forEach(function(pill) {
      pill.addEventListener('click', function() {
        var idx = parseInt(pill.getAttribute('data-step'));
        openReading(idx);
      });
    });

    var prevBtn = nav.querySelector('.diag-reading-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        openReading(currentReadingStep - 1);
      });
    }

    var nextBtn = nav.querySelector('.diag-reading-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        openReading(currentReadingStep + 1);
      });
    }

    var doneBtn = nav.querySelector('.diag-reading-done');
    if (doneBtn) {
      doneBtn.addEventListener('click', close);
    }
  }

  function loadModule(url) {
    var iframe = overlay.querySelector('.diag-reading-frame');
    var loader = overlay.querySelector('.diag-reading-loader');
    loader.style.display = 'flex';
    iframe.style.opacity = '0';
    iframe.src = url;
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
