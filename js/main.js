/* ════════════════════════════════════════════
   HELIX — MAIN HUB LOGIC
   main.js · nav, article list, viewer
════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── ELEMENTS ── */
  const sectorBtns   = document.querySelectorAll(".sector-btn");
  const panelHeader  = document.getElementById("panel-header");
  const articleList  = document.getElementById("article-list");
  const viewerPanel  = document.getElementById("viewer-panel");
  const viewerFrame  = document.getElementById("viewer-frame");
  const viewerBack   = document.getElementById("viewer-back");
  const viewerTitle  = document.getElementById("viewer-doc-title");
  const viewerDl     = document.getElementById("viewer-dl");
  const panelEmpty   = document.getElementById("panel-empty");
  const panelTag     = document.getElementById("panel-sector-tag");
  const panelName    = document.getElementById("panel-sector-name");
  const panelCount   = document.getElementById("panel-article-count");
  const railImgBox   = document.getElementById("rail-img-box");
  const railImg      = document.getElementById("rail-img");

  let activeSector = null;

  /* ── SECTOR IMAGE SWAP ── */
  function swapSectorImage(sector) {
    const imgMap = {
      H: "./assets/img/_1.png",
      E: "./assets/img/_2.png",
      L: "./assets/img/_3.png",
      I: "./assets/img/_4.png",
      X: "./assets/img/_5.png"
    };
    const src = imgMap[sector.letter];
    if (!src) return;

    // fade out → swap src → fade in
    railImg.classList.remove("loaded");
    railImgBox.classList.remove("empty");

    setTimeout(() => {
      railImg.src = src;
      railImg.onload = () => railImg.classList.add("loaded");
      // fallback if already cached
      if (railImg.complete) railImg.classList.add("loaded");
    }, 200);
  }

  /* ── SECTOR ACCENT VARS ── */
  function applySectorTheme(sector) {
    const root = document.documentElement;
    root.style.setProperty("--sector-color", sector.color);
    root.style.setProperty("--sector-glow",  sector.glow);
    root.style.setProperty("--sector-ghost", sector.ghost);
  }

  /* ── ARTICLE LIST RENDER ── */
  function renderArticleList(sector) {
    articleList.innerHTML = "";

    sector.articles.forEach((art, i) => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.style.animationDelay = `${0.04 + i * 0.07}s`;

      const statusLabel = art.status === "draft"
        ? `<span style="color:var(--text-faint);font-size:0.5rem;letter-spacing:0.18em;">DRAFT</span>`
        : `<span style="color:var(--green-dim);font-size:0.5rem;letter-spacing:0.18em;">PUBLISHED</span>`;

      const tagsHtml = art.tags.map(t =>
        `<span class="tag">${t}</span>`
      ).join("");

      card.innerHTML = `
        <div class="card-index">[${String(i + 1).padStart(2, "0")}]</div>
        <div class="card-body">
          <div class="card-title">${art.title}</div>
          <div class="card-meta">
            <span>${art.authors}</span>
            <span>${art.year}</span>
            ${statusLabel}
          </div>
          <div class="card-meta" style="margin-top:4px;">${tagsHtml}</div>
          <div class="card-abstract">${art.abstract}</div>
        </div>
        <div class="card-actions">
          <button class="btn-view" data-file="${art.file}" data-title="${art.title}">
            <span>◉</span> VIEW
          </button>
          <a class="btn-dl" href="${art.file}" download="${art.title}.pdf">
            <span>↓</span> DOWNLOAD
          </a>
        </div>
      `;

      // VIEW button handler
      card.querySelector(".btn-view").addEventListener("click", (e) => {
        const file  = e.currentTarget.dataset.file;
        const title = e.currentTarget.dataset.title;
        openViewer(file, title, sector);
      });

      articleList.appendChild(card);
    });
  }

  /* ── SELECT SECTOR ── */
  function selectSector(sectorData) {
    if (activeSector === sectorData.letter) return;
    activeSector = sectorData.letter;

    // update button active states
    sectorBtns.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.sector-btn[data-sector="${sectorData.letter}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    // apply theme
    applySectorTheme(sectorData);
    swapSectorImage(sectorData);

    // update panel header
    panelTag.textContent   = sectorData.letter;
    panelName.textContent  = `${sectorData.letter} — ${sectorData.word}`;
    panelCount.textContent = `${sectorData.articles.length} ARTICLE${sectorData.articles.length !== 1 ? "S" : ""}`;

    // hide viewer, show list
    closeViewer();

    // hide empty state
    panelEmpty.style.display = "none";

    // fade + render list
    articleList.style.opacity = "0";
    articleList.style.display = "flex";
    requestAnimationFrame(() => {
      articleList.style.transition = "opacity 0.2s ease";
      articleList.style.opacity = "1";
      renderArticleList(sectorData);
    });
  }

  /* ── OPEN PDF VIEWER ── */
  function openViewer(file, title, sector) {
    articleList.style.display = "none";
    panelEmpty.style.display  = "none";
    viewerPanel.style.display = "flex";

    viewerTitle.textContent  = title;
    viewerDl.href            = file;
    viewerDl.download        = title + ".pdf";
    viewerFrame.src          = file;

    // style back button to sector color
    viewerBack.style.color       = sector.color;
    viewerBack.style.borderColor = sector.color;
  }

  /* ── CLOSE VIEWER ── */
  function closeViewer() {
    viewerPanel.style.display  = "none";
    viewerFrame.src            = "";
    articleList.style.display  = "flex";
  }

  /* ── VIEWER BACK ── */
  viewerBack.addEventListener("click", () => {
    closeViewer();
    // re-render current sector list
    const sector = HELIX_SECTORS.find(s => s.letter === activeSector);
    if (sector) renderArticleList(sector);
  });

  /* ── WIRE NAV BUTTONS ── */
  sectorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const letter = btn.dataset.sector;
      const sector = HELIX_SECTORS.find(s => s.letter === letter);
      if (sector) selectSector(sector);
    });
  });

  /* ── PARTICLE BACKGROUND (minimal — reuse from splash) ── */
  function initParticles() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    let   W, H, particles;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r:  Math.random() * 1.2 + 0.3,
        a:  Math.random() * 0.25 + 0.06,
        c:  Math.random() > 0.85 ? "#ff6a00" : "#00e5ff"
      };
    }

    function initParticles() {
      particles = Array.from({ length: 55 }, mkParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.fillStyle   = p.c;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener("resize", () => { resize(); initParticles(); });
  }

  /* ── INIT ── */
  initParticles();

})();
