/* ============================================================
 *  경조사 데이터
 *  - category: "birthday" | "wedding" | "birth"
 *  - date: "YYYY-MM-DD" 또는 "YYYY-MM"
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.milestones = {
  categories: [
    { id: "birthday", label: "생일", labelEn: "Birthday"    },
    { id: "wedding",  label: "결혼", labelEn: "Wedding"     },
    { id: "birth",    label: "출산", labelEn: "New Arrival" }
  ],
  items: [
    {
      category: "birthday",
      date: "2026-05",
      name: "[성함]",
      message: "[생신 축하 메시지 — 동기 이름·생년월일·짧은 축하말]"
    },
    {
      category: "wedding",
      date: "2026-04",
      name: "[성함]",
      message: "[결혼 축하 메시지 — 결혼식 일자·장소·짧은 축사]"
    },
    {
      category: "birth",
      date: "2026-03",
      name: "[성함]",
      message: "[출산 축하 메시지 — 새 가족을 맞이한 동기에게]"
    }
  ]
};
