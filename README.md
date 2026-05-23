# 성균관대 IMBA 46기 Newsletter

동기 뉴스레터 정적 웹페이지. **HTML/CSS/JS만으로 구성**되어 있어 빌드 도구 없이 바로 실행·배포할 수 있습니다.

---

## 빠른 시작

### 1) 로컬에서 보기

가장 쉬운 방법:

- **`index.html` 파일을 더블클릭** → 브라우저에서 열립니다.
- 데이터는 `data/*.js` (전역 변수 방식)로 로드되므로 별도 서버가 필요 없습니다.

조금 더 권장되는 방법 (선택):

```powershell
# 프로젝트 폴더에서
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

### 2) 배포

배포 방법은 세 가지 — 권장 순서대로:

#### A. GitHub + Netlify 연동 (권장, 자동 배포)

가장 추천. 데이터 파일만 수정해서 push하면 사이트가 자동 업데이트됩니다.

1. **GitHub 저장소 생성**
   - https://github.com/new 에서 새 레포 생성 (Private 권장)
   - "Add a README" 등 옵션은 **체크 해제** (이미 README가 있음)
2. **로컬에서 push** (PowerShell)
   ```powershell
   git remote add origin https://github.com/<본인계정>/<레포명>.git
   git branch -M main
   git push -u origin main
   ```
3. **Netlify 연결**
   - https://app.netlify.com 로그인 → **Add new site → Import an existing project**
   - GitHub 선택 → 방금 만든 레포 선택
   - Build settings는 그대로 (이미 `netlify.toml`에 명시됨, 빌드 명령 없음)
   - **Deploy site** 클릭 → 1분 내 발급되는 `https://<자동이름>.netlify.app` 링크
4. **커스텀 도메인** (선택)
   - Netlify → Domain settings → 무료 서브도메인 이름 변경 가능

이후 콘텐츠 교체는 `data/*.js` 파일을 수정하고 push하면 끝 — Netlify가 자동으로 다시 배포합니다.

#### B. Netlify Drop (즉석 1회성 배포)

GitHub 없이 가장 빠른 방법.
- `claude_p1` 폴더 전체를 https://app.netlify.com/drop 에 드래그 → 즉시 링크 발급
- 이후 업데이트하려면 같은 자리에 다시 드래그

#### C. GitHub Pages

GitHub만 쓰고 싶을 때.
- 레포 push 후 Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)` 선택
- `https://<계정>.github.io/<레포명>` 으로 접속

---

## 콘텐츠 교체 가이드

코드를 건드리지 않고 **`data/` 폴더의 4개 파일만 수정**하면 됩니다.
모두 일반 텍스트 파일이므로 메모장으로 열어도 됩니다.

### `data/milestones.js` — 경조사

```js
{
  category: "wedding",        // wedding | birth | promotion | funeral
  date: "2026-04-19",         // YYYY-MM-DD
  name: "김OO 동기",
  message: "축하 메시지 자유 작성"
}
```

새 항목 추가 시 `items` 배열에 위 형식의 객체를 추가하면 됩니다.
카테고리별 색상은 자동으로 표시됩니다 (결혼=로즈, 출산=라이트 그린, 승진=딥 그린, 부고=차콜).

### `data/events-past.js` — 지난 행사 회고

```js
{
  date: "2025-08-22",
  title: "46기 입학 환영회",
  location: "성균관대 600주년기념관",
  description: "행사 설명 2~3줄",
  image: "images/events/orientation.jpg",  // 비우면 placeholder 표시
  tags: ["입학", "환영회"]
}
```

### `data/events-upcoming.js` — 예정 행사

```js
{
  date: "2026-06-19",
  title: "4차 정기모임",
  location: "장소명",
  description: "행사 안내",
  rsvpEmail: "imba46@example.com",          // 클릭 시 메일 작성창
  rsvpSubject: "[46기] 참석 신청",          // 메일 제목
  status: "open"                             // open | tba | closed
}
```

### `data/articles.js` — 동기 기고

본문은 블록 단위로 구성합니다.

```js
body: [
  { type: "heading",   text: "소제목" },
  { type: "paragraph", text: "문단 내용 (줄바꿈은 \\n)" },
  { type: "quote",     text: "인용구" },
  { type: "list",      items: ["항목 1", "항목 2", "항목 3"] }
]
```

기고글은 메인 페이지에서 카드로 표시되고, **"본문 펼치기"** 클릭 시 인라인으로 펼쳐집니다.

---

## 사진 추가 방법

1. **`images/events/`** 폴더에 사진 파일을 넣습니다.
   - 권장: 가로형 4:3 또는 16:9, 1MB 이내, 가로 1600px 이내
2. **`data/events-past.js`** 에서 해당 행사의 `image` 값을 수정합니다.
   ```js
   image: "images/events/2025-08-orientation.jpg"
   ```
3. 사진 없는 행사는 `image: ""` 로 두면 자동으로 placeholder 박스가 표시됩니다.

---

## 운영진/푸터 정보 수정

`index.html` 하단의 `<!-- FOOTER -->` 섹션에서 직접 수정합니다.

- 운영진 4명 자리: 회장 / 부회장 / 총무 / 편집
- 다음 호 발행 예정일

---

## 폴더 구조

```
claude_p1/
├── index.html                # 메인 페이지
├── styles/
│   ├── main.css              # 디자인 시스템 (컬러, 폰트, 마스트헤드)
│   └── sections.css          # 섹션별 레이아웃
├── scripts/
│   └── main.js               # 데이터 렌더링, 필터, 펼침 동작
├── data/                     # ← 콘텐츠 교체는 여기만!
│   ├── milestones.js
│   ├── events-past.js
│   ├── events-upcoming.js
│   └── articles.js
├── images/
│   └── events/               # 행사 사진 보관
├── reference/                # 디자인 레퍼런스 (작업용)
└── README.md
```

---

## 디자인 요약

- **컬러**: 따뜻한 크림 베이스(#F1ECDE) + 딥 그린 액센트(#1B5E3F) + 잉크 블랙
- **폰트**: Pretendard (한글 본문/제목) + Fraunces (영문 디스플레이 이탤릭)
- **반응형**: 모바일/태블릿/데스크탑 대응 (특히 카톡 공유 후 폰 열람 최적화)
- **데코**: 미세한 paper grain 오버레이, 마스트헤드의 글래스모피즘, 히어로 티커, 표지 카드 회전 효과

---

## 변경하고 싶을 때

| 변경 항목 | 파일 |
|---|---|
| 액센트 컬러 | `styles/main.css` 상단 `--green` 변수 |
| 발행 호수·날짜 | `index.html` 상단 마스트헤드 + 히어로 |
| 운영진 연락처 | `index.html` 푸터 |
| 동기 수 / 행사 수 통계 | `index.html` `.hero__stats` |
| 새 섹션 추가 | `index.html` + `styles/sections.css` |

---

문의: 46기 운영위
