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
   *  01 — Milestones
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

    // Card sort: newest first
    const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));

    sorted.forEach((item) => {
      const cat = categories.find((c) => c.id === item.category) || {};
      const card = el(
        "article",
        { class: "milestone-card", dataset: { category: item.category } },
        el(
          "div", { class: "milestone-card__head" },
          el("span", { class: "milestone-card__badge" }, cat.label || item.category),
          el("time", { class: "milestone-card__date" }, formatDateKR(item.date))
        ),
        el("h3", { class: "milestone-card__name" }, item.name),
        el("p", { class: "milestone-card__msg" }, item.message)
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

    const sorted = [...DATA.eventsPast].sort((a, b) => (a.date < b.date ? 1 : -1));

    sorted.forEach((ev) => {
      const photo = ev.image
        ? el("div", { class: "timeline__photo timeline__photo--has-image" },
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

      const item = el(
        "li", { class: "timeline__item" },
        el("div", { class: "timeline__date" },
          el("span", { class: "timeline__date-day" }, dayDigits(ev.date)),
          el("span", { class: "timeline__date-month" },
            monthAbbr(ev.date) + " · " + parseDate(ev.date).year)
        ),
        el("div", { class: "timeline__card" },
          photo,
          el("div", { class: "timeline__body" },
            el("h3", { class: "timeline__title" }, ev.title),
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
   *  03 — Upcoming Events
   * ============================================================ */
  function renderUpcoming() {
    const grid = document.querySelector("[data-upcoming-grid]");
    if (!grid || !DATA.eventsUpcoming) return;

    const STATUS_LABEL = {
      open:   "신청 접수 중",
      tba:    "추후 공지",
      closed: "마감"
    };

    const sorted = [...DATA.eventsUpcoming].sort((a, b) => (a.date < b.date ? -1 : 1));

    sorted.forEach((ev) => {
      const d = parseDate(ev.date);
      const statusClass = "upcoming-card__status upcoming-card__status--" + (ev.status || "tba");

      const mailHref =
        "mailto:" + (ev.rsvpEmail || "imba46@example.com") +
        (ev.rsvpSubject ? "?subject=" + encodeURIComponent(ev.rsvpSubject) : "");

      const card = el(
        "article", { class: "upcoming-card" },
        el("div", { class: "upcoming-card__head" },
          el("div", { class: "upcoming-card__cal" },
            el("span", { class: "upcoming-card__day" }, dayDigits(ev.date)),
            el("span", { class: "upcoming-card__month" }, monthAbbr(ev.date) + " · " + d.year)
          ),
          el("div", { class: "upcoming-card__title-block" },
            el("span", { class: statusClass }, STATUS_LABEL[ev.status] || "추후 공지"),
            el("h3", { class: "upcoming-card__title" }, ev.title)
          )
        ),
        el("div", { class: "upcoming-card__body" },
          el("p", { class: "upcoming-card__loc" }, ev.location),
          el("p", { class: "upcoming-card__desc" }, ev.description)
        ),
        el("div", { class: "upcoming-card__foot" },
          el("a", {
              class: "upcoming-card__rsvp",
              href: mailHref
            },
            "참석 신청",
            el("svg", {
              viewBox: "0 0 24 24",
              "aria-hidden": "true",
              html: '<path d="M5 19 L19 5 M19 5 H8 M19 5 V16" fill="none" stroke="currentColor" stroke-width="1.8"/>'
            })
          )
        )
      );

      grid.appendChild(card);
    });
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
              el("span", null, art.date || "")
            ),
            el("div", { class: "article__num" }, art.number || ""),
            el("div", { class: "article__cover-meta" },
              el("span", null, art.category || ""),
              el("span", null, art.readingTime || "")
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
            el("div", { class: "article__meta" },
              el("span", { class: "article__meta-item article__author" }, art.author),
              el("span", { class: "article__meta-item" }, art.affiliation),
              el("span", { class: "article__meta-item" }, formatDateKR(art.date)),
              el("span", { class: "article__meta-item" }, art.readingTime)
            ),
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
              toggle.addEventListener("click", () => {
                const open = article.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.querySelector(".article__toggle-label").textContent =
                  open ? "본문 접기" : "본문 펼치기";
                if (open) {
                  body.style.maxHeight = body.scrollHeight + "px";
                } else {
                  body.style.maxHeight = body.scrollHeight + "px";
                  // force reflow then collapse
                  body.offsetHeight;
                  body.style.maxHeight = "0px";
                }
              });
              // Recalculate on resize while open
              window.addEventListener("resize", () => {
                if (article.classList.contains("is-open")) {
                  body.style.maxHeight = "none";
                  const h = body.scrollHeight;
                  body.style.maxHeight = h + "px";
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
   *  Init
   * ============================================================ */
  function init() {
    renderMilestones();
    renderPastEvents();
    renderUpcoming();
    renderArticles();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
