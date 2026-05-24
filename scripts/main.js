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

    const sorted = [...DATA.eventsPast].sort((a, b) => (a.date < b.date ? -1 : 1));

    sorted.forEach((ev) => {
      const photo = ev.image
        ? el("button", {
              class: "timeline__photo timeline__photo--has-image",
              type: "button",
              "aria-label": ev.title + " 사진 크게 보기",
              onclick: () => openLightbox(ev.image, ev.title)
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
   *  Lightbox
   * ============================================================ */
  let lightboxEl = null;
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
    const stage = el("div", { class: "lightbox__stage" }, img, video, videoError, caption);

    lightboxEl = el("div", {
        class: "lightbox",
        role: "dialog",
        "aria-modal": "true",
        "aria-hidden": "true"
      },
      closeBtn,
      stage
    );

    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
    closeBtn.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightboxEl.classList.contains("is-open")) {
        closeLightbox();
      }
    });

    document.body.appendChild(lightboxEl);
    return lightboxEl;
  }
  function openLightbox(src, title) {
    const lb = ensureLightbox();
    lb.classList.remove("lightbox--video");
    lb.querySelector(".lightbox__img").src = src;
    lb.querySelector(".lightbox__img").alt = title || "";
    lb.querySelector(".lightbox__caption").textContent = title || "";
    const v = lb.querySelector(".lightbox__video");
    v.pause();
    v.removeAttribute("src");
    v.load();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function openVideoLightbox(src, title) {
    const lb = ensureLightbox();
    lb.classList.add("lightbox--video");
    lb.classList.remove("lightbox--video-error");
    lb.querySelector(".lightbox__img").removeAttribute("src");
    const v = lb.querySelector(".lightbox__video");
    v.src = src;
    v.load();
    v.play().catch(() => {});
    lb.querySelector(".lightbox__caption").textContent = title || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightboxEl) return;
    const v = lightboxEl.querySelector(".lightbox__video");
    if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    lightboxEl.classList.remove("is-open");
    lightboxEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
    renderPastEvents();
    renderMilestones();
    renderArticles();
    initGuestbook();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
