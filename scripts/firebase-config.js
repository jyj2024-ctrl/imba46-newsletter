/* ============================================================
 *  Firebase 설정 — 방명록(05 메시지) 기능에 사용됩니다.
 *
 *  사용 방법:
 *  1) https://console.firebase.google.com 에서 새 프로젝트 생성
 *  2) "웹 앱" 추가 → 표시되는 config 객체에서 아래 4개 값을 복사해 붙여넣기
 *  3) 좌측 메뉴 "Firestore Database" → "데이터베이스 만들기"
 *     - 위치는 asia-northeast3 (서울) 권장
 *     - 시작 모드는 "테스트 모드"로 시작 (30일 후 자동 잠금)
 *  4) 운영 단계에서는 "규칙(Rules)" 탭에서 아래 규칙으로 교체:
 *
 *     rules_version = '2';
 *     service cloud.firestore {
 *       match /databases/{database}/documents {
 *         match /messages/{id} {
 *           allow read: if true;
 *           allow create: if request.resource.data.keys().hasAll(
 *             ['name','message','passwordHash','createdAt']);
 *           allow update, delete: if true;
 *         }
 *       }
 *     }
 *
 *  키를 채우지 않으면 방명록 폼에 안내 문구가 표시됩니다.
 * ============================================================ */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyD4Vp9iK5RJ2iyalhTGNKCmTitMTkxLLaw",
  authDomain: "imba-46-newsletter.firebaseapp.com",
  projectId: "imba-46-newsletter",
  appId: "1:671110428546:web:17257da9781071a261c19b"
};
