/* ════════════════════════════════════════════
   HELIX — MAIN HUB LOGIC
   main.js
════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── ELEMENTS ── */
  const sectorBtns    = document.querySelectorAll(".sector-btn");
  const subtabs       = document.querySelectorAll(".subtab");
  const articleList   = document.getElementById("article-list");
  const viewerPanel   = document.getElementById("viewer-panel");
  const viewerFrame   = document.getElementById("viewer-frame");
  const viewerGrain   = document.getElementById("viewer-grain");
  const viewerBack    = document.getElementById("viewer-back");
  const viewerTitle   = document.getElementById("viewer-doc-title");
  const viewerDl      = document.getElementById("viewer-dl");
  const panelEmpty    = document.getElementById("panel-empty");
  const emptyMsg1     = document.getElementById("empty-msg-1");
  const emptyMsg2     = document.getElementById("empty-msg-2");
  const contentLetter = document.getElementById("content-sector-letter");
  const contentName   = document.getElementById("content-sector-name");

  let activeSector = null;
  let activeTab    = null;

  /* ── EMPTY STATE SWITCHING ── */
  function showEmptyState(state) {
    if (panelEmpty) panelEmpty.style.display = "flex";
    hide(articleList);
    hide(viewerPanel);
    if (emptyMsg1) emptyMsg1.classList.toggle("hidden", state !== 1);
    if (emptyMsg2) emptyMsg2.classList.toggle("hidden", state !== 2);
  }

  function applySectorTheme(s) {
    document.documentElement.style.setProperty("--sector-color", s.color);
    document.documentElement.style.setProperty("--sector-glow",  s.glow);
    document.documentElement.style.setProperty("--sector-ghost", s.ghost);
  }

  /* ── HELPERS ── */
  function show(el) { if (el) el.style.display = "flex"; }
  function hide(el) { if (el) el.style.display = "none"; }
  function updateNavCounts(tab) {
    sectorBtns.forEach(btn => {
      const s  = HELIX_SECTORS.find(x => x.letter === btn.dataset.sector);
      const el = btn.querySelector(".btn-count");
      if (!s || !el) return;
      const map   = { articles: s.articles, notes: s.notes, goals: s.goals };
      const arr   = map[tab] || [];
      const label = { articles:"ARTICLE", notes:"NOTE", goals:"GOAL" }[tab] || "";
      el.textContent = arr.length + " " + label + (arr.length !== 1 ? "S" : "");
    });
  }

  /* ── RENDER ── */
  function showContent() {
    hide(panelEmpty);
    hide(viewerPanel);
    articleList.innerHTML = "";
    show(articleList);
  }

  function renderArticles(s) {
    showContent();
    const items = s.articles || [];
    if (!items.length) { articleList.innerHTML = `<div class="panel-empty" style="opacity:1;flex:1"><div class="empty-label">NO ARTICLES YET</div></div>`; return; }
    items.forEach((art, i) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.style.animationDelay = `${i * 0.06}s`;
      const status = art.status === "draft"
        ? `<span style="color:var(--text-faint);font-size:12px;letter-spacing:.15em">DRAFT</span>`
        : `<span style="color:var(--green-dim);font-size:12px">PUBLISHED</span>`;
      const tags = (art.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
      card.innerHTML = `
        <div class="card-index">[${String(i+1).padStart(2,"0")}]</div>
        <div class="card-body">
          <div class="card-title">${art.title}</div>
          <div class="card-meta"><span>${art.authors}</span><span>${art.year}</span>${status}</div>
          <div class="card-meta" style="margin-top:4px">${tags}</div>
          <div class="card-abstract">${art.abstract}</div>
        </div>
        <div class="card-actions">
          <button class="btn-view" data-file="${art.file}" data-title="${art.title}"><span>◉</span> VIEW</button>
          <a class="btn-dl" href="${art.file}" download="${art.title}.pdf"><span>↓</span> DOWNLOAD</a>
        </div>`;
      card.querySelector(".btn-view").addEventListener("click", e => {
        openViewer(e.currentTarget.dataset.file, e.currentTarget.dataset.title, s);
      });
      articleList.appendChild(card);
    });
  }

  function renderNotes(s) {
    showContent();
    const items = s.notes || [];
    if (!items.length) { articleList.innerHTML = `<div class="panel-empty" style="opacity:1;flex:1"><div class="empty-label">NO NOTES YET</div></div>`; return; }
    items.forEach((note, i) => {
      const card = document.createElement("div");
      card.className = "note-card";
      card.style.animationDelay = `${i * 0.06}s`;
      card.innerHTML = `<div class="note-date">${note.date}</div><div class="note-text">${note.text}</div>`;
      articleList.appendChild(card);
    });
  }

  function renderGoals(s) {
    showContent();
    const items = s.goals || [];
    if (!items.length) { articleList.innerHTML = `<div class="panel-empty" style="opacity:1;flex:1"><div class="empty-label">NO GOALS YET</div></div>`; return; }
    items.forEach((goal, i) => {
      const card = document.createElement("div");
      card.className = "goal-card";
      card.style.animationDelay = `${i * 0.06}s`;
      card.innerHTML = `
        <div class="goal-status ${goal.done?"done":""}"></div>
        <div class="goal-body">
          <div class="goal-title">${goal.title}</div>
          <div class="goal-desc">${goal.desc}</div>
        </div>
        <div class="goal-priority">${goal.priority}</div>`;
      articleList.appendChild(card);
    });
  }

  function renderContent(s, tab) {
    if (tab === "articles") renderArticles(s);
    else if (tab === "notes")    renderNotes(s);
    else if (tab === "goals")    renderGoals(s);
  }

  /* ── SELECT SECTOR ── */
  function selectSector(s) {
    activeSector = s.letter;

    sectorBtns.forEach(b => b.classList.remove("active"));
    document.querySelector(`.sector-btn[data-sector="${s.letter}"]`)?.classList.add("active");

    applySectorTheme(s);
    if (contentLetter) contentLetter.textContent = s.letter;
    if (contentName)   contentName.textContent   = s.word;

    // first click auto-activates articles tab
    if (!activeTab) {
      activeTab = "articles";
      subtabs.forEach(t => t.classList.toggle("active", t.dataset.tab === "articles"));
      updateNavCounts("articles");
    }

    renderContent(s, activeTab);
  }

  /* ── VIEWER ── */
  function openViewer(file, title, s) {
    hide(articleList);
    show(viewerPanel);
    if (viewerTitle) viewerTitle.textContent = title;
    if (viewerDl)    { viewerDl.href = file; viewerDl.download = title + ".pdf"; }
    if (viewerGrain) viewerGrain.classList.remove("active");
    if (viewerFrame) {
      viewerFrame.src = file;
      viewerFrame.onload = () => {
        try {
          const body = viewerFrame.contentDocument?.body?.innerText || "";
          if (body.includes("Cannot GET") || body.includes("404")) {
            if (viewerGrain) viewerGrain.classList.add("active");
          }
        } catch(e) {}
      };
    }
    if (viewerBack) {
      viewerBack.style.color       = s.color;
      viewerBack.style.borderColor = s.color;
    }
  }

  function closeViewer() {
    hide(viewerPanel);
    if (viewerFrame) viewerFrame.src = "";
    if (viewerGrain) viewerGrain.classList.remove("active");
    show(articleList);
  }

  /* ── EVENTS ── */
  if (viewerBack) {
    viewerBack.addEventListener("click", () => {
      closeViewer();
      const s = HELIX_SECTORS.find(x => x.letter === activeSector);
      if (s) renderContent(s, activeTab);
    });
  }

  sectorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const s = HELIX_SECTORS.find(x => x.letter === btn.dataset.sector);
      if (s) selectSector(s);
    });
  });

  /* ── WIRE EMPTY STATE SECTOR LIST — clickable shortcut ── */
  document.querySelectorAll(".empty-sector-item").forEach(item => {
    item.addEventListener("click", () => {
      const s = HELIX_SECTORS.find(x => x.letter === item.dataset.sector);
      if (s) selectSector(s);
    });
  });

  subtabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      subtabs.forEach(t => t.classList.toggle("active", t === tab));
      updateNavCounts(activeTab);
      if (activeSector) {
        const s = HELIX_SECTORS.find(x => x.letter === activeSector);
        if (s) renderContent(s, activeTab);
      } else {
        // tab pressed but no sector yet — show state 2
        showEmptyState(2);
      }
    });
  });

  /* ── PARTICLES ── */
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, pts;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    const mkP    = () => ({ x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18, r:Math.random()*1.2+.3, a:Math.random()*.25+.06, c:Math.random()>.85?"#ff6a00":"#00e5ff" });
    const spawn  = () => { pts = Array.from({length:55}, mkP); };
    const draw   = () => {
      ctx.clearRect(0,0,W,H);
      for (const p of pts) {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.save(); ctx.globalAlpha=p.a; ctx.fillStyle=p.c;
        ctx.shadowBlur=8; ctx.shadowColor=p.c;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      requestAnimationFrame(draw);
    };
    resize(); spawn(); draw();
    window.addEventListener("resize", ()=>{ resize(); spawn(); });
  }

})();
