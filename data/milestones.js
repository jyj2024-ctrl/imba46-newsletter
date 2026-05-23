/* ============================================================
 *  경조사 데이터
 *  - 카테고리별로 분류된 동기 소식
 *  - category: "wedding" | "birth" | "birthday" | "funeral" | "promotion"
 *  - date: "YYYY-MM-DD" 또는 "YYYY-MM"
 *  - name, message는 자유롭게 수정
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.milestones = {
  categories: [
    { id: "wedding",   label: "결혼",      labelEn: "Wedding"      },
    { id: "birth",     label: "출산",      labelEn: "New Arrival"  },
    { id: "birthday",  label: "생일",      labelEn: "Birthday"     },
    { id: "promotion", label: "승진·이직", labelEn: "Career"       },
    { id: "funeral",   label: "부고",      labelEn: "In Memoriam"  }
  ],
  items: [
    {
      category: "wedding",
      date: "2026-04-19",
      name: "김OO 동기",
      message: "[축하 메시지 — 결혼식 일자와 짧은 축사를 적어주세요]"
    },
    {
      category: "wedding",
      date: "2026-03-08",
      name: "이OO 동기",
      message: "[축하 메시지 — 동기들의 축하 한 마디]"
    },
    {
      category: "birth",
      date: "2026-05-02",
      name: "박OO 동기",
      message: "[새 가족을 맞이한 동기에게 — 자녀 이름, 짧은 인사 등]"
    },
    {
      category: "birth",
      date: "2026-02-14",
      name: "정OO 동기",
      message: "[출산 소식 — 축하 메시지가 들어갈 자리]"
    },
    {
      category: "promotion",
      date: "2026-01-01",
      name: "최OO 동기",
      message: "[이직·승진 소식 — 회사명·직책 등을 함께 적어주세요]"
    },
    {
      category: "promotion",
      date: "2026-03-15",
      name: "윤OO 동기",
      message: "[승진 축하 — 새 자리에서의 활약을 응원합니다]"
    },
    {
      category: "funeral",
      date: "2026-02-28",
      name: "한OO 동기",
      message: "[부친상 / 모친상 등 — 삼가 깊은 위로의 말씀을 전합니다]"
    }
  ]
};
