/* ============================================================
 *  46기 집행부 명단
 *  - lead: 기대표 / 부기대표
 *  - departments: 각 부서별 부장(head) + 부원(members)
 * ============================================================ */

window.NEWSLETTER_DATA = window.NEWSLETTER_DATA || {};

window.NEWSLETTER_DATA.exec = {
  lead: [
    { role: "기대표",   name: "신지윤", photo: "images/신지윤.jpg" },
    { role: "부기대표", name: "장연주", photo: "images/장연주.jpg" }
  ],
  departments: [
    {
      id: "plan",
      label: "기획부",
      labelEn: "Planning",
      head: { name: "조웅기", photo: "images/조웅기.jpg" },
      members: ["한보미", "이민재", "이상용", "정윤철"]
    },
    {
      id: "network",
      label: "네트워크부",
      labelEn: "Network",
      head: { name: "홍성민", photo: "images/홍성민.jpg" },
      members: ["최승규", "손여울", "조근행", "김덕현"]
    },
    {
      id: "academic",
      label: "학술부",
      labelEn: "Academic",
      head: { name: "설윤호", photo: "images/설윤호.jpeg" },
      members: ["윤지목", "문재웅", "주현정", "이준선"]
    },
    {
      id: "finance",
      label: "총무부",
      labelEn: "Finance",
      head: { name: "윤용상", photo: "images/윤용상.jpg" },
      members: ["강병희", "윤미래", "김호중"]
    }
  ]
};
