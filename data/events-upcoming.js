/* ============================================================
 *  예정 행사 (2026.06 ~ 2026.12)
 *  - rsvpEmail: 신청 메일 주소 (mailto 링크로 자동 연결)
 *  - rsvpSubject: 메일 제목 (선택)
 *  - status: "open" | "tba" | "closed"
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.eventsUpcoming = [
  {
    date: "2026-06-19",
    title: "4차 정기모임",
    location: "[장소 미정]",
    description: "[행사 안내 — 일정, 회비, 프로그램 등을 적어주세요]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 6월 정기모임 참석 신청",
    status: "open"
  },
  {
    date: "2026-07-18",
    title: "여름 워크샵 (1박 2일)",
    location: "강원 / [리조트명]",
    description: "[행사 안내 — 워크샵 주제, 숙소, 가족 동반 여부 등]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 여름 워크샵 참석 신청",
    status: "open"
  },
  {
    date: "2026-09-12",
    title: "가을 야유회",
    location: "[장소 미정]",
    description: "[행사 안내 — 가을 단풍 명소에서 진행 예정]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 가을 야유회 참석 신청",
    status: "tba"
  },
  {
    date: "2026-10-17",
    title: "동문 골프대회",
    location: "[CC명]",
    description: "[행사 안내 — 46기 단독 라운드 / 동문 연합 라운드 여부]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 가을 골프대회 참석 신청",
    status: "tba"
  },
  {
    date: "2026-11-14",
    title: "동문 초청 강연 + 네트워킹",
    location: "[장소 미정]",
    description: "[행사 안내 — 강연자 섭외 중, 추후 공지 예정]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 11월 강연회 참석 신청",
    status: "tba"
  },
  {
    date: "2026-12-18",
    title: "송년의 밤",
    location: "[장소 미정]",
    description: "[행사 안내 — 한 해를 마무리하는 송년회, 시상식 포함]",
    rsvpEmail: "imba46@example.com",
    rsvpSubject: "[46기] 송년의 밤 참석 신청",
    status: "tba"
  }
];
