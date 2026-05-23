/* ============================================================
 *  동기 기고글
 *  - 메인 페이지에서 카드 형태로 미리보기 표시,
 *    "본문 펼치기" 클릭 시 인라인으로 본문이 펼쳐집니다.
 *  - body 배열의 각 블록 타입:
 *      { type: "heading",   text: "..." }  // 소제목
 *      { type: "paragraph", text: "..." }  // 문단
 *      { type: "quote",     text: "..." }  // 인용구
 *      { type: "list",      items: [...] } // 불릿 리스트
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.articles = [
  {
    id: "glp1",
    number: "01",
    category: "Healthcare",
    categoryKo: "헬스케어",
    title: "GLP-1, 비만치료의 새로운 시대",
    subtitle: "[부제 — 한 줄로 글의 핵심을 요약해주세요]",
    author: "[저자명]",
    affiliation: "[제약회사명] · [부서/직책]",
    date: "2026-05",
    readingTime: "약 8분",
    excerpt: "[기고글 도입부 발췌 — 2~3문장으로 독자의 흥미를 끌 수 있는 부분을 적어주세요. 본문에서 가장 매력적인 한 단락을 미리 보여주는 자리입니다.]",
    body: [
      { type: "heading",   text: "들어가며" },
      { type: "paragraph", text: "[GLP-1 본문이 들어갈 자리 — 도입부]\n글의 배경과 문제의식, 동기들에게 이 주제를 소개하는 이유 등을 적어주세요." },

      { type: "heading",   text: "1. GLP-1이란 무엇인가" },
      { type: "paragraph", text: "[작용 기전 설명이 들어갈 자리]\n비전공 동기들도 이해할 수 있도록 쉬운 비유와 함께 설명해주세요." },

      { type: "heading",   text: "2. 시장 현황과 주요 제품" },
      { type: "paragraph", text: "[Wegovy, Mounjaro 등 글로벌 시장 분석이 들어갈 자리]" },
      { type: "list", items: [
          "[제품 1 — 회사·적응증·주요 데이터]",
          "[제품 2 — 회사·적응증·주요 데이터]",
          "[제품 3 — 회사·적응증·주요 데이터]"
      ]},

      { type: "heading",   text: "3. 한국 시장의 기회와 과제" },
      { type: "paragraph", text: "[국내 출시 현황, 보험 급여, 유통 채널 등 한국 특수성에 대한 내용]" },

      { type: "quote",     text: "[글 전체를 관통하는 핵심 메시지나 인용구를 한 줄로]" },

      { type: "heading",   text: "마치며" },
      { type: "paragraph", text: "[전망과 결론 — 동기들에게 전하고 싶은 메시지]" }
    ]
  },
  {
    id: "ai",
    number: "02",
    category: "Technology",
    categoryKo: "AI · 테크",
    title: "[AI 기고글 제목 — 한 줄로 강렬하게]",
    subtitle: "[부제 — 한 줄로 글의 핵심을 요약해주세요]",
    author: "[저자명]",
    affiliation: "[AI 스타트업명] · [부서/직책]",
    date: "2026-05",
    readingTime: "약 7분",
    excerpt: "[기고글 도입부 발췌 — 현장에서 보는 AI의 변화, 동기들이 가장 궁금해할 만한 부분을 미리 보여주세요.]",
    body: [
      { type: "heading",   text: "들어가며" },
      { type: "paragraph", text: "[AI 기고 본문이 들어갈 자리 — 도입부]\n현재 AI 산업의 흐름과 글의 관점을 소개해주세요." },

      { type: "heading",   text: "1. 현장에서 본 변화" },
      { type: "paragraph", text: "[스타트업 현장에서 직접 경험한 AI의 변화]" },

      { type: "heading",   text: "2. 비즈니스 모델의 재구성" },
      { type: "paragraph", text: "[AI가 기존 산업 구조와 비즈니스 모델을 어떻게 바꾸고 있는지]" },
      { type: "list", items: [
          "[관점 1 — 짧은 설명]",
          "[관점 2 — 짧은 설명]",
          "[관점 3 — 짧은 설명]"
      ]},

      { type: "heading",   text: "3. MBA에게 던지는 질문" },
      { type: "paragraph", text: "[동기들에게 의미 있는 시사점 — 커리어, 의사결정, 투자 관점 등]" },

      { type: "quote",     text: "[글의 핵심 메시지를 한 줄로]" },

      { type: "heading",   text: "마치며" },
      { type: "paragraph", text: "[전망과 결론]" }
    ]
  }
];
