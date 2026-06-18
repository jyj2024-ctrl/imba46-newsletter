/* ============================================================
 *  성균관대 IMBA 46기 Newsletter — 렌더링 스크립트
 *  - data/*.js에서 window.NEWSLETTER_DATA로 데이터 주입
 *  - 4개 섹션 동적 렌더링 + 필터링 + 기고 인라인 펼침
 * ============================================================ */

(function () {
  "use strict";

  const DATA = window.NEWSLETTER_DATA || {};

  /* ---------- Date helpers ---------- */
  const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  function parseDate(s) {
    if (!s) return null;
    const parts = s.split("-").map(Number);
    return {
      year: parts[0],
      month: parts[1] || 1,
      day: parts[2] || 1,
      raw: s
    };
  }
  function formatDateKR(s) {
    const d = parseDate(s);
    if (!d) return "";
    if (s.length === 7) return `${d.year}.${String(d.month).padStart(2,"0")}`;
    return `${d.year}.${String(d.month).padStart(2,"0")}.${String(d.day).padStart(2,"0")}`;
  }
  function monthAbbr(s) {
    const d = parseDate(s);
    return d ? MONTH_ABBR[d.month - 1] : "";
  }
  function dayDigits(s) {
    const d = parseDate(s);
    return d ? String(d.day).padStart(2, "0") : "";
  }

  /* ---------- Utilities ---------- */
  const SVG_NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, ...children) {
    const node = tag === "svg"
      ? document.createElementNS(SVG_NS, "svg")
      : document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "class")        node.setAttribute("class", attrs[k]);
        else if (k === "html")    node.innerHTML = attrs[k];
        else if (k.startsWith("on")) node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "dataset") Object.assign(node.dataset, attrs[k]);
        else                      node.setAttribute(k, attrs[k]);
      });
    }
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ============================================================
   *  01 — Executive Team (집행부 소개)
   * ============================================================ */
  function renderExec() {
    const root = document.querySelector("[data-exec]");
    if (!root || !DATA.exec) return;

    const { lead, departments } = DATA.exec;
    const byId = Object.fromEntries(departments.map((d) => [d.id, d]));

    // 기대표 → 기획부 + 총무부 / 부기대표 → 네트워크부 + 학술부
    const groups = [
      { leader: lead[0], children: [byId.plan, byId.finance] },
      { leader: lead[1], children: [byId.network, byId.academic] }
    ];

    function buildLeadCard(p) {
      return el("div", { class: "exec__lead-card" },
        p.photo
          ? el("div", { class: "exec__lead-photo" },
              el("img", { src: p.photo, alt: p.name, loading: "lazy" })
            )
          : null,
        el("div", { class: "exec__lead-text" },
          el("span", { class: "exec__lead-role" }, p.role),
          el("span", { class: "exec__lead-name" }, p.name)
        ),
        el("span", { class: "exec__lead-card-stamp" }, "46th")
      );
    }

    function buildDeptCard(d) {
      if (!d) return null;
      const headBlock = d.head
        ? el("div", { class: "exec__dept-headcard" },
            d.head.photo
              ? el("div", { class: "exec__dept-photo" },
                  el("img", { src: d.head.photo, alt: d.head.name, loading: "lazy" })
                )
              : null,
            el("div", { class: "exec__dept-headcard-text" },
              el("span", { class: "exec__dept-headcard-role" }, "부장"),
              el("span", { class: "exec__dept-headcard-name" }, d.head.name)
            )
          )
        : null;

      return el("div", { class: "exec__dept", dataset: { dept: d.id } },
        el("div", { class: "exec__dept-head" },
          el("span", { class: "exec__dept-label" }, d.label),
          el("em", { class: "exec__dept-label-en" }, d.labelEn)
        ),
        headBlock,
        el("ul", { class: "exec__dept-members" },
          ...d.members.map((m) => el("li", null, m))
        )
      );
    }

    const tree = el("div", { class: "exec__tree" },
      ...groups.map((g) =>
        el("div", { class: "exec__group" },
          buildLeadCard(g.leader),
          el("div", { class: "exec__connector", "aria-hidden": "true" },
            el("span", { class: "exec__conn-stem-top" }),
            el("span", { class: "exec__conn-bar" }),
            el("span", { class: "exec__conn-stem exec__conn-stem--left" }),
            el("span", { class: "exec__conn-stem exec__conn-stem--right" })
          ),
          el("div", { class: "exec__children" },
            ...g.children.map(buildDeptCard)
          )
        )
      )
    );
    root.appendChild(tree);
  }

  /* ============================================================
   *  03 — Milestones
   * ============================================================ */
  function renderMilestones() {
    const grid = document.querySelector("[data-milestones-grid]");
    const filterBar = document.querySelector("[data-filter-bar]");
    if (!grid || !DATA.milestones) return;

    const { categories, items } = DATA.milestones;

    // Filter pills
    const counts = { all: items.length };
    categories.forEach((c) => {
      counts[c.id] = items.filter((i) => i.category === c.id).length;
    });

    const pills = [
      { id: "all", label: "전체" },
      ...categories
    ];

    pills.forEach((p) => {
      const btn = el(
        "button",
        {
          class: "filter-pill" + (p.id === "all" ? " is-active" : ""),
          dataset: { filter: p.id },
          role: "tab",
          "aria-selected": p.id === "all" ? "true" : "false"
        },
        p.label,
        el("span", { class: "filter-pill__count" }, `(${counts[p.id] || 0})`)
      );
      btn.addEventListener("click", () => applyFilter(p.id));
      filterBar.appendChild(btn);
    });

    // Card sort: items with dates first (newest first), then dateless items
    const sorted = [...items].sort((a, b) => {
      const ad = a.date || "";
      const bd = b.date || "";
      if (!ad && !bd) return 0;
      if (!ad) return 1;
      if (!bd) return -1;
      return ad < bd ? 1 : -1;
    });

    const ICONS = {
      job: '<path d="M3.5 8h17v11.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6.2A1.7 1.7 0 0 1 10.7 4.5h2.6A1.7 1.7 0 0 1 15 6.2V8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3.5 12.5h17" stroke="currentColor" stroke-width="1.6"/>',
      wedding: '<path d="M12 20.6s-6.6-4.2-6.6-9.7c0-2.5 2-4.4 4.3-4.4 1.3 0 2.5.7 3.3 1.8.8-1.1 2-1.8 3.3-1.8 2.3 0 4.3 1.9 4.3 4.4 0 5.5-6.6 9.7-6.6 9.7z" fill="currentColor"/>',
      birth: '<rect x="8" y="9.5" width="8" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="9.8" y="4.5" width="4.4" height="3.6" rx="0.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 13h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9.5 16h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
      broadcast: '<rect x="3" y="7.5" width="18" height="11" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 3.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21.5h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    };

    function buildActions(item) {
      const actions = [];
      if (item.photos && item.photos.length) {
        const btn = el("button", {
          type: "button",
          class: "milestone-card__action"
        },
          el("svg", {
            class: "milestone-card__action-icon",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            html: '<rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10.5" r="1.6" fill="currentColor"/><path d="M5 18l4.5-5 4 4 3-3 3 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
          }),
          "출연사진"
        );
        btn.addEventListener("click", () => openLightbox(item.photos, 0, item.name || ""));
        actions.push(btn);
      }
      if (item.link) {
        actions.push(el("a", {
            class: "milestone-card__action",
            href: item.link,
            target: "_blank",
            rel: "noopener noreferrer"
          },
          el("svg", {
            class: "milestone-card__action-icon",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            html: '<path d="M10 8 L16 12 L10 16 Z" fill="currentColor"/>'
          }),
          "영상보기"
        ));
      }
      if (!actions.length) return null;
      return el("div", { class: "milestone-card__actions" }, ...actions);
    }

    sorted.forEach((item) => {
      const cat = categories.find((c) => c.id === item.category) || {};
      const iconHtml = ICONS[item.category];
      const badgeChildren = [];
      if (iconHtml) {
        badgeChildren.push(el("svg", {
          class: "milestone-card__badge-icon",
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
          html: iconHtml
        }));
      }
      badgeChildren.push(cat.label || item.category);

      const card = el(
        "article",
        { class: "milestone-card", dataset: { category: item.category } },
        el(
          "div", { class: "milestone-card__head" },
          el("span", { class: "milestone-card__badge" }, ...badgeChildren),
          item.date ? el("time", { class: "milestone-card__date" }, formatDateKR(item.date)) : null,
          buildActions(item)
        ),
        el(
          "div", { class: "milestone-card__body" },
          el("h3", { class: "milestone-card__name" }, item.name),
          item.message ? el("p", { class: "milestone-card__msg" }, item.message) : null
        )
      );
      grid.appendChild(card);
    });

    function applyFilter(id) {
      filterBar.querySelectorAll(".filter-pill").forEach((p) => {
        const active = p.dataset.filter === id;
        p.classList.toggle("is-active", active);
        p.setAttribute("aria-selected", active ? "true" : "false");
      });
      grid.querySelectorAll(".milestone-card").forEach((card) => {
        const show = id === "all" || card.dataset.category === id;
        card.style.display = show ? "" : "none";
      });
    }
  }

  /* ============================================================
   *  02 — Past Events (Timeline)
   * ============================================================ */
  function renderPastEvents() {
    const root = document.querySelector("[data-timeline]");
    if (!root || !DATA.eventsPast) return;

    const sorted = [...DATA.eventsPast].sort((a, b) => (a.date < b.date ? -1 : 1));

    sorted.forEach((ev) => {
      const gallerySrcs = (ev.gallery && ev.gallery.length) ? ev.gallery : (ev.image ? [ev.image] : []);
      const photo = ev.image
        ? el("button", {
              class: "timeline__photo timeline__photo--has-image",
              type: "button",
              "aria-label": ev.title + (gallerySrcs.length > 1 ? " 갤러리 (" + gallerySrcs.length + "장) 크게 보기" : " 사진 크게 보기"),
              onclick: () => openLightbox(gallerySrcs, 0, ev.title)
            },
            el("img", { src: ev.image, alt: ev.title, loading: "lazy" })
          )
        : el("div", { class: "timeline__photo" },
            el("div", { class: "timeline__photo-label" },
              el("svg", {
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                html: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/><path d="M3 17 L9 12 L13 15 L17 11 L21 14" fill="none" stroke="currentColor" stroke-width="1.2"/>'
              }),
              el("span", null, "사진 들어갈 자리")
            )
          );

      const tags = (ev.tags || []).map((t) =>
        el("span", { class: "timeline__tag" }, "#" + t)
      );

      const titleChildren = [document.createTextNode(ev.title)];
      if (ev.video) {
        titleChildren.push(
          el("button", {
              class: "timeline__play-mini",
              type: "button",
              "aria-label": ev.title + " 영상 재생",
              title: "영상 재생",
              onclick: () => openVideoLightbox(ev.video, ev.title)
            },
            el("svg", {
              viewBox: "0 0 24 24",
              "aria-hidden": "true",
              html: '<circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M10 8 L16 12 L10 16 Z" fill="#fff"/>'
            })
          )
        );
      }

      const item = el(
        "li", { class: "timeline__item" },
        el("div", { class: "timeline__date" },
          el("span", { class: "timeline__date-month" }, monthAbbr(ev.date)),
          el("span", { class: "timeline__date-year" }, String(parseDate(ev.date).year))
        ),
        el("div", { class: "timeline__card" },
          photo,
          el("div", { class: "timeline__body" },
            el("h3", { class: "timeline__title" }, ...titleChildren),
            el("p", { class: "timeline__loc" }, ev.location),
            el("p", { class: "timeline__desc" }, ev.description),
            tags.length ? el("div", { class: "timeline__tags" }, ...tags) : null
          )
        )
      );
      root.appendChild(item);
    });
  }

  /* ============================================================
   *  Lightbox (with gallery support)
   * ============================================================ */
  let lightboxEl = null;
  let lbGallery = [];
  let lbIndex = 0;
  let lbSwapTimer = null;
  let lbTitle = "";
  let lbPrevFocus = null;
  let lbTouchStartX = 0;
  let lbTouchStartY = 0;

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    const img = el("img", { class: "lightbox__img", alt: "" });
    const video = el("video", {
      class: "lightbox__video",
      controls: "",
      playsinline: ""
    });
    const videoError = el("div", { class: "lightbox__video-error" },
      el("strong", null, "이 브라우저에서 재생할 수 없는 영상 형식입니다."),
      el("p", null, "원본이 HEVC(H.265) 코덱으로 인코딩돼 있어 Chrome·Firefox에서는 영상이 표시되지 않습니다. H.264(MP4)로 변환해 같은 파일명으로 교체해주세요.")
    );
    video.addEventListener("error", () => {
      lightboxEl.classList.add("lightbox--video-error");
    });
    video.addEventListener("loadeddata", () => {
      if (video.videoWidth === 0) {
        lightboxEl.classList.add("lightbox--video-error");
      }
    });
    const caption = el("p", { class: "lightbox__caption" });
    const counter = el("span", { class: "lightbox__counter", "aria-live": "polite" });
    const closeBtn = el("button", {
        class: "lightbox__close",
        type: "button",
        "aria-label": "닫기"
      },
      el("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        html: '<path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      })
    );
    const prevBtn = el("button", {
        class: "lightbox__nav lightbox__nav--prev",
        type: "button",
        "aria-label": "이전 사진"
      },
      el("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        html: '<path d="M15 4 L7 12 L15 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      })
    );
    const nextBtn = el("button", {
        class: "lightbox__nav lightbox__nav--next",
        type: "button",
        "aria-label": "다음 사진"
      },
      el("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        html: '<path d="M9 4 L17 12 L9 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
      })
    );
    const stage = el("div", { class: "lightbox__stage" },
      img, video, videoError,
      el("div", { class: "lightbox__meta" }, caption, counter)
    );

    lightboxEl = el("div", {
        class: "lightbox",
        role: "dialog",
        "aria-modal": "true",
        "aria-hidden": "true"
      },
      closeBtn,
      prevBtn,
      nextBtn,
      stage
    );

    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showLbIndex(lbIndex - 1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showLbIndex(lbIndex + 1); });

    document.addEventListener("keydown", (e) => {
      if (!lightboxEl.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeLightbox(); return; }
      if (lightboxEl.classList.contains("lightbox--video")) return;
      if (lbGallery.length < 2) {
        if (e.key === "Tab") trapFocus(e);
        return;
      }
      if (e.key === "ArrowLeft")  { e.preventDefault(); showLbIndex(lbIndex - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); showLbIndex(lbIndex + 1); }
      else if (e.key === "Home")  { e.preventDefault(); showLbIndex(0); }
      else if (e.key === "End")   { e.preventDefault(); showLbIndex(lbGallery.length - 1); }
      else if (e.key === "Tab")   { trapFocus(e); }
    });

    // Touch swipe (mobile)
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      lbTouchStartX = e.touches[0].clientX;
      lbTouchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (lbGallery.length < 2) return;
      if (lightboxEl.classList.contains("lightbox--video")) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - lbTouchStartX;
      const dy = t.clientY - lbTouchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) showLbIndex(lbIndex + 1);
      else showLbIndex(lbIndex - 1);
    }, { passive: true });

    document.body.appendChild(lightboxEl);
    return lightboxEl;
  }

  function trapFocus(e) {
    const focusables = lightboxEl.querySelectorAll(
      "button:not([disabled]):not([hidden])"
    );
    const visible = Array.from(focusables).filter((b) => b.offsetParent !== null);
    if (!visible.length) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function showLbIndex(idx) {
    if (!lbGallery.length) return;
    const n = lbGallery.length;
    const next = ((idx % n) + n) % n;
    if (next === lbIndex && lightboxEl.querySelector(".lightbox__img").src) return;
    const img = lightboxEl.querySelector(".lightbox__img");
    const direction = next > lbIndex || (lbIndex === n - 1 && next === 0) ? "right" : "left";

    // Cancel any in-flight swap from a previous rapid click so the new image
    // appears immediately instead of waiting for the queued timeout.
    if (lbSwapTimer) {
      clearTimeout(lbSwapTimer);
      lbSwapTimer = null;
    }

    img.classList.remove("is-entering-left", "is-entering-right");
    img.classList.add(direction === "right" ? "is-leaving-left" : "is-leaving-right");

    lbSwapTimer = setTimeout(() => {
      lbSwapTimer = null;
      img.src = lbGallery[next];
      img.alt = lbTitle ? lbTitle + " (" + (next + 1) + "/" + n + ")" : "";
      img.classList.remove("is-leaving-left", "is-leaving-right");
      img.classList.add(direction === "right" ? "is-entering-right" : "is-entering-left");
      requestAnimationFrame(() => {
        img.classList.remove("is-entering-left", "is-entering-right");
      });
    }, 70);
    lbIndex = next;
    updateLbCounter();
  }

  function updateLbCounter() {
    const counter = lightboxEl.querySelector(".lightbox__counter");
    if (lbGallery.length > 1) {
      counter.textContent = (lbIndex + 1) + " / " + lbGallery.length;
      counter.style.display = "";
      lightboxEl.classList.add("lightbox--has-nav");
    } else {
      counter.textContent = "";
      counter.style.display = "none";
      lightboxEl.classList.remove("lightbox--has-nav");
    }
  }

  function openLightbox(srcOrArr, startIndex, title) {
    const lb = ensureLightbox();
    lbGallery = Array.isArray(srcOrArr) ? srcOrArr.slice() : [srcOrArr];
    lbIndex = Math.max(0, Math.min(startIndex || 0, lbGallery.length - 1));
    lbTitle = title || "";
    lbPrevFocus = document.activeElement;

    lb.classList.remove("lightbox--video", "lightbox--video-error");
    const img = lb.querySelector(".lightbox__img");
    img.classList.remove("is-leaving-left", "is-leaving-right", "is-entering-left", "is-entering-right");
    img.src = lbGallery[lbIndex];
    img.alt = lbTitle ? lbTitle + (lbGallery.length > 1 ? " (" + (lbIndex + 1) + "/" + lbGallery.length + ")" : "") : "";
    lb.querySelector(".lightbox__caption").textContent = lbTitle;
    updateLbCounter();

    const v = lb.querySelector(".lightbox__video");
    v.pause(); v.removeAttribute("src"); v.load();

    lb.classList.add("is-open");
    lb.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    setTimeout(() => lb.querySelector(".lightbox__close").focus(), 50);
  }

  function openVideoLightbox(src, title) {
    const lb = ensureLightbox();
    lbGallery = [];
    lbIndex = 0;
    lbTitle = title || "";
    lbPrevFocus = document.activeElement;

    lb.classList.add("lightbox--video");
    lb.classList.remove("lightbox--video-error", "lightbox--has-nav");
    lb.querySelector(".lightbox__img").removeAttribute("src");
    lb.querySelector(".lightbox__counter").textContent = "";
    const v = lb.querySelector(".lightbox__video");
    v.src = src;
    v.load();
    v.play().catch(() => {});
    lb.querySelector(".lightbox__caption").textContent = lbTitle;
    lb.classList.add("is-open");
    lb.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    setTimeout(() => lb.querySelector(".lightbox__close").focus(), 50);
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    const v = lightboxEl.querySelector(".lightbox__video");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    // Restore focus BEFORE setting aria-hidden to avoid "descendant retained focus" warning
    if (lbPrevFocus && typeof lbPrevFocus.focus === "function") {
      try { lbPrevFocus.focus(); } catch (_) { document.body.focus(); }
    } else {
      try { document.body.focus(); } catch (_) {}
    }
    lbPrevFocus = null;
    lightboxEl.classList.remove("is-open");
    lightboxEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }

  /* ============================================================
   *  04 — Articles (inline expand)
   * ============================================================ */
  function renderArticles() {
    const list = document.querySelector("[data-articles-list]");
    if (!list || !DATA.articles) return;

    DATA.articles.forEach((art) => {
      const body = el("div", { class: "article__full" });
      const bodyInner = el("div", { class: "article__full-inner" });
      bodyInner.appendChild(el("div", { class: "article__full-rule" }));

      (art.body || []).forEach((block) => {
        if (block.type === "heading") {
          bodyInner.appendChild(el("h4", { class: "article__h3" }, block.text));
        } else if (block.type === "paragraph") {
          bodyInner.appendChild(el("p", { class: "article__p" }, block.text));
        } else if (block.type === "quote") {
          bodyInner.appendChild(el("blockquote", { class: "article__quote" }, block.text));
        } else if (block.type === "list") {
          const ul = el("ul", { class: "article__list" });
          (block.items || []).forEach((li) => ul.appendChild(el("li", null, li)));
          bodyInner.appendChild(ul);
        } else if (block.type === "image") {
          const fig = el("figure", { class: "article__figure" },
            el("img", {
              class: "article__image",
              src: block.src,
              alt: block.alt || "",
              loading: "lazy"
            })
          );
          if (block.caption) {
            fig.appendChild(el("figcaption", { class: "article__caption" }, block.caption));
          }
          bodyInner.appendChild(fig);
        }
      });
      body.appendChild(bodyInner);

      const article = el(
        "article", { class: "article", dataset: { articleId: art.id } },
        el("div", { class: "article__head" },
          // Cover panel (left)
          el("div", { class: "article__cover" },
            el("div", { class: "article__number-row" },
              el("span", null, "Essay"),
              art.date ? el("span", null, art.date) : null
            ),
            el("div", { class: "article__num" }, art.number || ""),
            (art.author || art.affiliation)
              ? el("div", { class: "article__cover-byline" },
                  el("span", { class: "article__cover-byline-label" }, "Written by"),
                  art.author ? el("span", { class: "article__cover-author" }, art.author) : null,
                  art.affiliation ? el("span", { class: "article__cover-affiliation" }, art.affiliation) : null
                )
              : null,
            el("div", { class: "article__cover-meta" },
              el("span", null, art.category || ""),
              art.readingTime ? el("span", null, art.readingTime) : null
            )
          ),
          // Body (right)
          el("div", { class: "article__body" },
            el("span", { class: "article__category" },
              art.category,
              art.categoryKo ? el("em", null, art.categoryKo) : null
            ),
            el("h3", { class: "article__title" }, art.title),
            el("p", { class: "article__subtitle" }, art.subtitle),
            (art.date || art.readingTime)
              ? el("div", { class: "article__meta" },
                  art.date ? el("span", { class: "article__meta-item" }, formatDateKR(art.date)) : null,
                  art.readingTime ? el("span", { class: "article__meta-item" }, art.readingTime) : null
                )
              : null,
            el("p", { class: "article__excerpt" }, art.excerpt),
            (function () {
              const toggle = el("button", {
                  class: "article__toggle",
                  "aria-expanded": "false"
                },
                el("span", { class: "article__toggle-label" }, "본문 펼치기"),
                el("svg", {
                  viewBox: "0 0 24 24",
                  "aria-hidden": "true",
                  html: '<path d="M6 9 L12 15 L18 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
                })
              );
              let openTransitionHandler = null;
              const releaseMaxHeight = (e) => {
                if (e && e.propertyName !== "max-height") return;
                if (!article.classList.contains("is-open")) return;
                body.style.maxHeight = "none";
              };

              toggle.addEventListener("click", () => {
                const open = article.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.querySelector(".article__toggle-label").textContent =
                  open ? "본문 접기" : "본문 펼치기";

                if (openTransitionHandler) {
                  body.removeEventListener("transitionend", openTransitionHandler);
                  openTransitionHandler = null;
                }

                if (open) {
                  body.style.maxHeight = body.scrollHeight + "px";
                  openTransitionHandler = releaseMaxHeight;
                  body.addEventListener("transitionend", openTransitionHandler);
                } else {
                  // From "none" or px → first lock to current height for animation
                  body.style.maxHeight = body.scrollHeight + "px";
                  body.offsetHeight; // force reflow
                  body.style.maxHeight = "0px";
                }
              });

              // Safety net: when lazy-loaded images inside the body finish loading
              // while the card is open, re-release the max-height in case the
              // browser had capped it before the image dimensions were known.
              body.querySelectorAll("img").forEach((img) => {
                img.addEventListener("load", () => {
                  if (article.classList.contains("is-open")) {
                    body.style.maxHeight = "none";
                  }
                });
              });

              // Recalculate on resize while open — keep it released so reflow
              // can adjust naturally without a hard pixel cap.
              window.addEventListener("resize", () => {
                if (article.classList.contains("is-open")) {
                  body.style.maxHeight = "none";
                }
              });
              return toggle;
            })()
          )
        ),
        body
      );

      list.appendChild(article);
    });
  }

  /* ============================================================
   *  04.5 — Leadership Messages (축사)
   * ============================================================ */
  function renderLeadershipMessages() {
    const root = document.querySelector("[data-leadership-messages]");
    if (!root || !DATA.leadershipMessages) return;

    DATA.leadershipMessages.forEach((m) => {
      const cover = el("div", { class: "leader-msg__cover" },
        m.photo
          ? el("img", { class: "leader-msg__photo", src: m.photo, alt: (m.name || "") + " 사진", loading: "lazy" })
          : el("div", { class: "leader-msg__photo leader-msg__photo--empty", "aria-hidden": "true" },
              el("svg", {
                viewBox: "0 0 24 24",
                html: '<circle cx="12" cy="9" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c1.6-3.4 4.7-5.4 8-5.4s6.4 2 8 5.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
              })
            ),
        el("div", { class: "leader-msg__role" },
          m.name ? el("span", { class: "leader-msg__speaker-name" }, m.name) : null,
          m.title ? el("span", { class: "leader-msg__speaker-title" }, m.title) : null
        )
      );

      const body = el("div", { class: "leader-msg__body" },
        el("span", { class: "leader-msg__quote-mark", "aria-hidden": "true" }, "“"),
        el("p", { class: "leader-msg__text" }, m.body || "")
      );

      const card = el("article", { class: "leader-msg", dataset: { leaderId: m.id || "" } }, cover, body);
      root.appendChild(card);
    });
  }

  /* ============================================================
   *  04.7 — Sponsors (찬조)
   * ============================================================ */
  function renderSponsors() {
    const root = document.querySelector("[data-sponsors]");
    if (!root || !DATA.sponsors) return;

    const { cash = [], inKind = [], posters = {} } = DATA.sponsors;

    const cashTotal = cash.reduce((sum, s) => sum + (s.amount || 0), 0);
    const fmtKRW = (n) => new Intl.NumberFormat("ko-KR").format(n) + "원";
    const isVideoFile = (p) => /\.(mp4|mov|webm|m4v)$/i.test(p);

    // ─── 현금 찬조 패널 ───────────────────────────────
    const cashRows = cash.map((s) => {
      const poster = posters[s.name];
      let nameNode;
      if (poster) {
        nameNode = el("button", {
          type: "button",
          class: "sponsor-row__name sponsor-row__name--clickable",
          title: s.name + " 찬조 포스터 보기"
        }, s.name);
        nameNode.addEventListener("click", () => {
          const title = s.name + " 찬조";
          if (isVideoFile(poster)) {
            openVideoLightbox(poster, title);
          } else {
            openLightbox([poster], 0, title);
          }
        });
      } else {
        nameNode = el("span", { class: "sponsor-row__name" }, s.name);
      }
      return el("li", { class: "sponsor-row" },
        nameNode,
        el("span", { class: "sponsor-row__sep", "aria-hidden": "true" }),
        el("span", { class: "sponsor-row__value sponsor-row__value--amount" }, fmtKRW(s.amount || 0))
      );
    });
    const cashPanel = el("article", { class: "sponsor-panel sponsor-panel--cash", dataset: { kind: "cash" } },
      el("header", { class: "sponsor-panel__head" },
        el("span", { class: "sponsor-panel__badge" },
          el("svg", {
            class: "sponsor-panel__icon",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            html: '<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 9v6M17.5 9v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
          }),
          el("span", { class: "sponsor-panel__label" }, "현금 찬조"),
          el("span", { class: "sponsor-panel__label-en" }, "Cash")
        ),
        el("div", { class: "sponsor-panel__meta" },
          el("span", { class: "sponsor-panel__count" }, cash.length + "건"),
          el("span", { class: "sponsor-panel__total" }, "총 " + fmtKRW(cashTotal))
        )
      ),
      el("p", { class: "sponsor-panel__note" }, "이름 클릭 시, 찬조 포스터 확인 가능"),
      el("ul", { class: "sponsor-list" }, ...cashRows)
    );

    // ─── 현물 찬조 패널 ───────────────────────────────
    const inKindRows = inKind.map((s) =>
      el("li", { class: "sponsor-card" },
        el("span", { class: "sponsor-card__name" }, s.name),
        el("span", { class: "sponsor-card__item" }, s.item || "")
      )
    );
    const inKindPanel = el("article", { class: "sponsor-panel sponsor-panel--inkind", dataset: { kind: "inkind" } },
      el("header", { class: "sponsor-panel__head" },
        el("span", { class: "sponsor-panel__badge" },
          el("svg", {
            class: "sponsor-panel__icon",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            html: '<path d="M4 9h16v11.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5V9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V9H3V6.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 5v16" stroke="currentColor" stroke-width="1.6"/><path d="M12 5s-2.4-2.5-4-1.5C6.6 4.4 7.5 6.5 9.5 7c.8.2 2.5 0 2.5 0M12 5s2.4-2.5 4-1.5c1.4 1 .5 3-1.5 3.5-.8.2-2.5 0-2.5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
          }),
          el("span", { class: "sponsor-panel__label" }, "현물 찬조"),
          el("span", { class: "sponsor-panel__label-en" }, "In-kind")
        ),
        el("div", { class: "sponsor-panel__meta" },
          el("span", { class: "sponsor-panel__count" }, inKind.length + "건")
        )
      ),
      el("ul", { class: "sponsor-list" }, ...inKindRows)
    );

    root.appendChild(cashPanel);
    root.appendChild(inKindPanel);
  }

  /* ============================================================
   *  05 — Guestbook (46기에 전하는 메시지)
   *  Firestore 컬렉션: "messages"
   *  Doc: { name, message, passwordHash, createdAt, updatedAt? }
   * ============================================================ */
  async function sha256Hex(str) {
    const buf = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function fmtTs(ts) {
    if (!ts || !ts.toDate) return "";
    const d = ts.toDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${day} ${hh}:${mm}`;
  }

  function showStatus(msg, type) {
    const node = document.querySelector("[data-guestbook-status]");
    if (!node) return;
    node.textContent = msg;
    node.className = "guestbook-status" + (type ? " guestbook-status--" + type : "");
    node.hidden = false;
    if (type !== "error") {
      setTimeout(() => { node.hidden = true; }, 3500);
    }
  }

  function initGuestbook() {
    const grid = document.querySelector("[data-messages-grid]");
    const form = document.querySelector("[data-guestbook-form]");
    if (!grid || !form) return;

    const cfg = window.FIREBASE_CONFIG || {};
    const configured = cfg.apiKey && cfg.projectId && cfg.appId;

    if (!configured || typeof firebase === "undefined") {
      form.hidden = true;
      const hint = document.querySelector("[data-guestbook-hint]");
      const status = document.querySelector("[data-guestbook-status]");
      const msg = "방명록 기능을 사용하려면 Firebase 설정이 필요합니다. scripts/firebase-config.js 파일을 채워주세요.";
      if (hint) hint.textContent = msg;
      if (status) { status.textContent = msg; status.className = "guestbook-status guestbook-status--info"; status.hidden = false; }
      return;
    }

    firebase.initializeApp(cfg);
    const db = firebase.firestore();
    const col = db.collection("messages");

    function render(docs) {
      grid.innerHTML = "";
      if (docs.length === 0) {
        grid.appendChild(el("p", { class: "guestbook-empty" }, "아직 남겨진 메시지가 없습니다. 첫 메시지를 남겨주세요."));
        return;
      }
      docs.forEach((doc) => {
        const d = doc.data();
        const entry = el("article", { class: "msg-entry", dataset: { id: doc.id } },
          el("header", { class: "msg-entry__head" },
            el("span", { class: "msg-entry__from" }, d.name || "익명"),
            el("span", { class: "msg-entry__time" },
              fmtTs(d.createdAt) + (d.updatedAt ? " · 수정됨" : "")
            )
          ),
          el("p", { class: "msg-entry__body" }, d.message || ""),
          el("div", { class: "msg-entry__actions" },
            el("button", {
                type: "button",
                class: "msg-entry__btn",
                onclick: () => editMessage(doc.id, d)
              }, "수정"),
            el("button", {
                type: "button",
                class: "msg-entry__btn msg-entry__btn--danger",
                onclick: () => deleteMessage(doc.id, d)
              }, "삭제")
          )
        );
        grid.appendChild(entry);
      });
    }

    // 실시간 구독
    col.orderBy("createdAt", "desc").onSnapshot(
      (snap) => {
        render(snap.docs);
      },
      (err) => {
        console.error("Firestore 구독 오류:", err);
        showStatus("메시지를 불러오지 못했습니다: " + err.message, "error");
      }
    );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const message = String(fd.get("message") || "").trim();
      const password = String(fd.get("password") || "").trim();
      if (!name || !message || !/^\d{4}$/.test(password)) return;

      const submitBtn = form.querySelector("[data-guestbook-submit]");
      submitBtn.disabled = true;
      try {
        const passwordHash = await sha256Hex(password);
        await col.add({
          name, message, passwordHash,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        form.reset();
        showStatus("메시지가 등록되었습니다.", "ok");
      } catch (err) {
        console.error(err);
        showStatus("등록 실패: " + err.message, "error");
      } finally {
        submitBtn.disabled = false;
      }
    });

    async function editMessage(id, doc) {
      const pw = window.prompt("수정하려면 작성 시 입력한 4자리 비밀번호를 입력해주세요.");
      if (pw == null) return;
      const hash = await sha256Hex(String(pw).trim());
      if (hash !== doc.passwordHash) {
        showStatus("비밀번호가 일치하지 않습니다.", "error");
        return;
      }
      const next = window.prompt("새 메시지를 입력해주세요.", doc.message || "");
      if (next == null) return;
      const trimmed = next.trim();
      if (!trimmed) return;
      try {
        await col.doc(id).update({
          message: trimmed.slice(0, 300),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showStatus("메시지가 수정되었습니다.", "ok");
      } catch (err) {
        showStatus("수정 실패: " + err.message, "error");
      }
    }

    async function deleteMessage(id, doc) {
      const pw = window.prompt("삭제하려면 작성 시 입력한 4자리 비밀번호를 입력해주세요.");
      if (pw == null) return;
      const hash = await sha256Hex(String(pw).trim());
      if (hash !== doc.passwordHash) {
        showStatus("비밀번호가 일치하지 않습니다.", "error");
        return;
      }
      if (!window.confirm("정말 삭제할까요?")) return;
      try {
        await col.doc(id).delete();
        showStatus("메시지가 삭제되었습니다.", "ok");
      } catch (err) {
        showStatus("삭제 실패: " + err.message, "error");
      }
    }
  }

  /* ============================================================
   *  Init
   * ============================================================ */
  function init() {
    renderExec();
    renderLeadershipMessages();
    renderPastEvents();
    renderMilestones();
    renderArticles();
    renderSponsors();
    initGuestbook();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
