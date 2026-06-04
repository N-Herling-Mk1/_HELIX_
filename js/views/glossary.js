/* ═══════════════════════════════════════════════════════════
   HELIX — GLOSSARY SYSTEM   js/views/glossary.js

   JSON-driven, twin-surface (same pattern as references.js):
     • Inline:  <dfn data-term="infonce">InfoNCE</dfn>
                → dotted-underline term; click opens a definition modal.
     • Panel:   the glossary panel mounts <div id="glossary-host"></div>;
                HelixGlossary.renderTable() fills it (grouped by category).

   Edit content/glossary.json, commit, push.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var URL = "../content/glossary.json";
  var DATA = null;
  var INDEX = {};          // id -> term object
  var loading = null;
  var modal = null;

  function ensure() {
    if (DATA) return Promise.resolve(DATA);
    if (!loading) {
      loading = fetch(URL)
        .then(function (r) { if (!r.ok) throw new Error(r.status + " " + r.statusText); return r.json(); })
        .then(function (j) {
          DATA = j;
          (j.terms || []).forEach(function (t) { INDEX[t.id] = t; });
          return j;
        });
    }
    return loading;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ── modal (built once, reused) ── */
  function buildModal() {
    if (modal) return modal;
    var back = document.createElement("div");
    back.className = "gloss-modal-back";
    back.innerHTML =
      '<div class="gloss-modal" role="dialog" aria-modal="true">' +
        '<button class="gloss-modal-x" aria-label="Close">&times;</button>' +
        '<div class="gloss-modal-cat"></div>' +
        '<h3 class="gloss-modal-term"></h3>' +
        '<p class="gloss-modal-def"></p>' +
        '<a class="gloss-modal-more" href="#glossary">Open full glossary →</a>' +
      "</div>";
    document.body.appendChild(back);
    function close() { back.classList.remove("is-open"); }
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    back.querySelector(".gloss-modal-x").addEventListener("click", close);
    back.querySelector(".gloss-modal-more").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    modal = back;
    return back;
  }

  function openModal(id) {
    ensure().then(function () {
      var t = INDEX[id];
      if (!t) return;
      var m = buildModal();
      m.querySelector(".gloss-modal-cat").textContent = t.cat || "";
      m.querySelector(".gloss-modal-term").textContent = t.term;
      m.querySelector(".gloss-modal-def").textContent = t.def || t.gloss || "";
      m.classList.add("is-open");
    });
  }

  /* ── inline <dfn data-term> → clickable term ── */
  function process(root) {
    if (!root) return;
    return ensure().then(function () {
      var tags = root.querySelectorAll("dfn[data-term]");
      [].forEach.call(tags, function (el) {
        if (el.dataset.done === "1") return;
        var id = el.getAttribute("data-term");
        var t = INDEX[id];
        if (!t) { el.className = "gloss-missing"; el.dataset.done = "1"; return; }
        el.className = "gloss";
        el.setAttribute("title", t.gloss || "");            // native hover fallback
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.addEventListener("click", function () { openModal(id); });
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(id); }
        });
        el.dataset.done = "1";
      });
    });
  }

  /* ── full table, grouped by category, with live filter bar ── */
  function renderTable(el) {
    if (!el) return;
    return ensure().then(function () {
      var terms = (DATA && DATA.terms) || [];
      if (!terms.length) { el.innerHTML = "<p class='doc-p'>No terms yet.</p>"; return; }
      var cats = (DATA.categories && DATA.categories.length)
        ? DATA.categories
        : terms.map(function (t) { return t.cat || "Other"; })
               .filter(function (v, i, a) { return a.indexOf(v) === i; });

      var total = terms.length;

      /* search bar + results host */
      el.innerHTML =
        '<div class="gloss-search">' +
          '<input type="text" class="gloss-search-input" id="gloss-filter" ' +
            'placeholder="Filter terms\u2026  (e.g. InfoNCE, partition, MSVtx)" ' +
            'autocomplete="off" spellcheck="false" aria-label="Filter glossary terms">' +
          '<span class="gloss-search-count" id="gloss-count"></span>' +
        '</div>' +
        '<div class="gloss-results" id="gloss-results"></div>';

      var results = el.querySelector("#gloss-results");
      var countEl = el.querySelector("#gloss-count");
      var input   = el.querySelector("#gloss-filter");

      /* build grouped tables once; rows carry a searchable haystack */
      var html = "";
      cats.forEach(function (cat) {
        var group = terms.filter(function (t) { return (t.cat || "Other") === cat; })
                         .sort(function (a, b) { return a.term.localeCompare(b.term); });
        if (!group.length) return;
        html += '<div class="gloss-group" data-cat="' + esc(cat) + '">';
        html += '<h3 class="gloss-cat">' + esc(cat) + "</h3>";
        html += '<table class="gloss-table"><tbody>';
        group.forEach(function (t) {
          var hay = [t.term, t.cat, t.def, t.gloss, t.id]
            .join(" ").toLowerCase();
          html +=
            '<tr id="term-' + esc(t.id) + '" class="gloss-row" data-search="' + esc(hay) + '">' +
              '<th class="gloss-term">' + esc(t.term) + "</th>" +
              '<td class="gloss-def">' + esc(t.def || t.gloss || "") + "</td>" +
            "</tr>";
        });
        html += "</tbody></table></div>";
      });
      results.innerHTML = html;

      var groups = [].slice.call(results.querySelectorAll(".gloss-group"));
      var empty  = null;

      function applyFilter(q) {
        q = (q || "").trim().toLowerCase();
        var shown = 0;
        groups.forEach(function (g) {
          var groupShown = 0;
          [].forEach.call(g.querySelectorAll(".gloss-row"), function (r) {
            var match = !q || r.getAttribute("data-search").indexOf(q) !== -1;
            r.style.display = match ? "" : "none";
            if (match) { shown++; groupShown++; }
          });
          g.style.display = groupShown ? "" : "none";
        });

        countEl.textContent = q ? (shown + " / " + total + " terms")
                                : (total + " terms");

        if (!shown) {
          if (!empty) {
            empty = document.createElement("p");
            empty.className = "gloss-empty";
            results.appendChild(empty);
          }
          empty.textContent = "No terms match \u201C" + q + "\u201D.";
          empty.style.display = "";
        } else if (empty) {
          empty.style.display = "none";
        }
      }

      input.addEventListener("input", function () { applyFilter(input.value); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && input.value) { input.value = ""; applyFilter(""); }
      });

      applyFilter("");
    });
  }

  window.HelixGlossary = { process: process, renderTable: renderTable, open: openModal, ensure: ensure };
})();
