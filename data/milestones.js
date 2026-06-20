/* ============================================================
 *  경조사 데이터
 *  - category: "job" | "wedding" | "birth"
 *  - date: "YYYY-MM-DD" 또는 "YYYY-MM" (이직은 비워둘 수 있음)
 *  - company: 이직 카테고리에서 사용 (옮긴 회사)
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.milestones = {
  categories: [
    { id: "job",       label: "이직", labelEn: "Job Change"  },
    { id: "wedding",   label: "결혼", labelEn: "Wedding"     },
    { id: "birth",     label: "출산", labelEn: "New Arrival" },
    { id: "broadcast", label: "방송", labelEn: "On Air"      }
  ],
  items: [
    /* ───────── 이직 ───────── */
    { category: "job", name: "지승열", company: "니어스랩",     date: "", message: "니어스랩으로 이직을 축하합니다" },
    { category: "job", name: "김성원", company: "EQTY",         date: "", message: "EQTY로 이직을 축하합니다" },
    { category: "job", name: "문재웅", company: "선그로우코리아", date: "", message: "선그로우코리아로 이직을 축하합니다" },
    { category: "job", name: "홍성민", company: "코스알엑스",   date: "", message: "코스알엑스로 이직을 축하합니다" },
    { category: "job", name: "김나영", company: "토스증권",     date: "", message: "토스증권으로 이직을 축하합니다" },
    { category: "job", name: "박재완", company: "두산건설",     date: "", message: "두산건설로 이직을 축하합니다" },

    /* ───────── 결혼 ───────── */
    { category: "wedding", name: "박재완", date: "", message: "5월 16일 결혼을 축하합니다" },
    { category: "wedding", name: "박충혁", date: "", message: "6월 28일 결혼을 축하합니다" },

    /* ───────── 출산 ───────── */
    { category: "birth", name: "문재웅", date: "", message: "1월에 첫째 공주님 출산을 축하합니다" },

    /* ───────── 방송 ───────── */
    {
      category: "broadcast",
      name: "안준영",
      date: "",
      message: "한국경제TV 〈몸쓸이야기〉 출연을 축하합니다",
      photos: ["images/안준영.jpg", "images/안준영1.jpg"],
      link: "https://youtu.be/NL55rSvLb6E?si=mD6jD8w7s6t0CEAs"
    }
  ]
};
