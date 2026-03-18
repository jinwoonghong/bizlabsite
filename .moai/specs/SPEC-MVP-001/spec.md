---
id: SPEC-MVP-001
version: "1.0.0"
status: approved
created: "2026-03-17"
updated: "2026-03-17"
author: MoAI
priority: high
---

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-03-17 | MoAI | 초기 MVP SPEC 작성 |

---

# SPEC-MVP-001: bizlabsite 연구실 논문 관리 서비스 MVP

## 1. Environment (환경)

### 1.1 프로젝트 개요

bizlabsite는 연구실 논문 메타데이터 및 원문 링크를 관리하는 반응형 웹 서비스이다. 연구실 구성원 누구나 논문을 등록할 수 있으며, 수정/삭제는 관리자 비밀번호를 통해 보호된다.

### 1.2 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | ^15.0.0 |
| Language | TypeScript | ^5.5.0 |
| Runtime | React | ^19.0.0 |
| Database | SQLite + Prisma ORM | Prisma ^6.0.0 |
| Styling | Tailwind CSS | ^4.0.0 |
| Package Manager | npm / pnpm | latest |

### 1.3 대상 사용자

- 연구실 구성원 (논문 등록, 조회, 검색)
- 연구실 관리자 (논문 수정, 삭제 - 비밀번호 인증)

### 1.4 운영 환경

- 브라우저: Chrome, Firefox, Safari, Edge 최신 2개 버전
- 디바이스: 모바일 (360px+), 태블릿 (768px+), 데스크탑 (1024px+)
- 배포: Vercel 또는 로컬 서버

---

## 2. Assumptions (가정)

- A1: SQLite는 연구실 규모(수백~수천 건)의 논문 데이터를 처리하기에 충분하다.
- A2: 관리자 비밀번호는 `.env` 파일의 `ADMIN_PASSWORD` 환경변수로 관리되며, 단일 비밀번호 방식이다.
- A3: 사용자 계정 시스템(회원가입/로그인)은 MVP 범위에 포함되지 않는다.
- A4: 논문 원문 파일 업로드는 MVP 범위에 포함되지 않으며, 외부 링크(URL)만 지원한다.
- A5: 동시 접속자 수는 10명 이하로 가정한다.
- A6: 다국어 지원은 MVP 범위에 포함되지 않으며, 한국어 UI를 기본으로 한다.

---

## 3. Requirements (요구사항)

### 모듈 1: 데이터 모델 및 API

#### REQ-DM-001 [Ubiquitous]
시스템은 **항상** 다음 필드를 포함하는 Paper 데이터 모델을 유지해야 한다:
- `id`: 자동 증가 정수 (PK)
- `title`: 논문 제목 (필수, 문자열)
- `authors`: 저자 목록 (필수, 문자열)
- `year`: 발행 연도 (필수, 정수)
- `journal`: 저널/학회명 (선택, 문자열)
- `link`: 논문 원문 URL (선택, 문자열)
- `abstract`: 논문 초록 (선택, 문자열)
- `createdAt`: 등록 일시 (자동 생성, DateTime)
- `updatedAt`: 수정 일시 (자동 갱신, DateTime)

#### REQ-DM-002 [Ubiquitous]
시스템은 **항상** Prisma ORM을 통해 SQLite 데이터베이스와 상호작용해야 하며, Prisma Client 싱글톤 패턴(`src/lib/prisma.ts`)을 사용해야 한다.

#### REQ-DM-003 [Event-Driven]
**WHEN** `GET /api/papers` 요청이 수신되면 **THEN** 시스템은 검색 조건(query, year)과 정렬 옵션(sortBy, order)을 적용하여 논문 목록을 JSON 배열로 반환해야 한다.

#### REQ-DM-004 [Event-Driven]
**WHEN** `POST /api/papers` 요청이 유효한 논문 데이터와 함께 수신되면 **THEN** 시스템은 새 논문을 데이터베이스에 저장하고 생성된 논문 객체를 201 상태 코드와 함께 반환해야 한다.

#### REQ-DM-005 [Event-Driven]
**WHEN** `GET /api/papers/[id]` 요청이 수신되면 **THEN** 시스템은 해당 ID의 논문 상세 정보를 JSON 객체로 반환해야 한다.

#### REQ-DM-006 [Event-Driven]
**WHEN** `PUT /api/papers/[id]` 요청이 유효한 관리자 비밀번호와 수정 데이터와 함께 수신되면 **THEN** 시스템은 해당 논문 정보를 갱신하고 갱신된 객체를 반환해야 한다.

#### REQ-DM-007 [Event-Driven]
**WHEN** `DELETE /api/papers/[id]` 요청이 유효한 관리자 비밀번호와 함께 수신되면 **THEN** 시스템은 해당 논문을 데이터베이스에서 삭제하고 204 상태 코드를 반환해야 한다.

#### REQ-DM-008 [Unwanted]
존재하지 않는 ID로 `GET /api/papers/[id]`, `PUT /api/papers/[id]`, `DELETE /api/papers/[id]` 요청이 수신되면, 시스템은 404 상태 코드와 적절한 에러 메시지를 반환**해야 한다**.

#### REQ-DM-009 [Unwanted]
필수 필드(title, authors, year)가 누락된 `POST /api/papers` 요청이 수신되면, 시스템은 400 상태 코드와 필드별 검증 에러 메시지를 반환**해야 한다**.

#### REQ-DM-010 [Unwanted]
`link` 필드에 유효하지 않은 URL 형식이 제공되면, 시스템은 400 상태 코드와 URL 형식 에러 메시지를 반환**해야 한다**.

---

### 모듈 2: 논문 등록/조회

#### REQ-CR-001 [Event-Driven]
**WHEN** 사용자가 논문 등록 페이지(`/papers/new`)에 접속하면 **THEN** 시스템은 제목, 저자, 발행연도, 저널명, 링크, 초록 입력 폼을 표시해야 한다.

#### REQ-CR-002 [Event-Driven]
**WHEN** 사용자가 필수 필드(제목, 저자, 발행연도)를 입력하고 등록 버튼을 클릭하면 **THEN** 시스템은 논문을 저장하고 메인 페이지(`/`)로 리다이렉트해야 한다.

#### REQ-CR-003 [Ubiquitous]
시스템은 **항상** 메인 페이지(`/`)에서 등록된 논문 목록을 카드 형태로 표시해야 하며, 각 카드에는 제목, 저자, 발행연도, 저널명이 포함되어야 한다.

#### REQ-CR-004 [Event-Driven]
**WHEN** 사용자가 논문 카드를 클릭하면 **THEN** 시스템은 논문 상세 페이지(`/papers/[id]`)로 이동하여 모든 메타데이터를 표시해야 한다.

#### REQ-CR-005 [State-Driven]
**IF** 논문에 `link` 값이 존재하면 **THEN** 시스템은 상세 페이지에서 "원문 보기" 링크를 외부 탭(`target="_blank"`)으로 표시해야 한다.

#### REQ-CR-006 [State-Driven]
**IF** 등록된 논문이 없는 상태이면 **THEN** 시스템은 메인 페이지에 "등록된 논문이 없습니다" 안내 메시지와 논문 등록 링크를 표시해야 한다.

---

### 모듈 3: 논문 수정/삭제 및 관리자 인증

#### REQ-AD-001 [Event-Driven]
**WHEN** 사용자가 논문 상세 페이지에서 "수정" 버튼을 클릭하면 **THEN** 시스템은 관리자 비밀번호 입력 모달을 표시해야 한다.

#### REQ-AD-002 [Event-Driven]
**WHEN** 올바른 관리자 비밀번호가 입력되면 **THEN** 시스템은 논문 수정 페이지(`/papers/[id]/edit`)로 이동하여 기존 데이터가 채워진 수정 폼을 표시해야 한다.

#### REQ-AD-003 [Event-Driven]
**WHEN** 사용자가 수정 폼에서 변경사항을 입력하고 저장 버튼을 클릭하면 **THEN** 시스템은 관리자 비밀번호와 함께 PUT 요청을 전송하여 논문을 갱신하고 상세 페이지로 리다이렉트해야 한다.

#### REQ-AD-004 [Event-Driven]
**WHEN** 사용자가 논문 상세 페이지에서 "삭제" 버튼을 클릭하면 **THEN** 시스템은 관리자 비밀번호 입력 모달과 삭제 확인 메시지를 표시해야 한다.

#### REQ-AD-005 [Event-Driven]
**WHEN** 올바른 관리자 비밀번호와 함께 삭제가 확인되면 **THEN** 시스템은 DELETE 요청을 전송하여 논문을 삭제하고 메인 페이지로 리다이렉트해야 한다.

#### REQ-AD-006 [Unwanted]
잘못된 관리자 비밀번호가 입력되면, 시스템은 "비밀번호가 올바르지 않습니다" 에러 메시지를 모달 내에 표시하고 해당 작업을 차단**해야 한다**.

#### REQ-AD-007 [Ubiquitous]
시스템은 **항상** 관리자 비밀번호를 서버 측에서만 검증해야 하며, 클라이언트에 `ADMIN_PASSWORD` 환경변수를 노출하지 않아야 한다.

#### REQ-AD-008 [Ubiquitous]
시스템은 **항상** PUT/DELETE API 요청 시 요청 본문의 `password` 필드를 `process.env.ADMIN_PASSWORD`와 비교하여 검증해야 한다.

---

### 모듈 4: 검색 및 필터링

#### REQ-SF-001 [Event-Driven]
**WHEN** 사용자가 검색창에 키워드를 입력하면 **THEN** 시스템은 제목, 저자, 저널명에서 해당 키워드를 포함하는 논문을 필터링하여 표시해야 한다.

#### REQ-SF-002 [Optional]
**가능하면** 시스템은 검색 결과를 사용자가 타이핑할 때 실시간으로 갱신(디바운스 적용, 300ms) 제공해야 한다.

#### REQ-SF-003 [Event-Driven]
**WHEN** 사용자가 발행연도 필터를 선택하면 **THEN** 시스템은 해당 연도의 논문만 표시해야 한다.

#### REQ-SF-004 [Event-Driven]
**WHEN** 사용자가 정렬 옵션을 변경하면 **THEN** 시스템은 선택된 기준(최신순, 오래된순, 제목순)으로 논문 목록을 재정렬해야 한다.

#### REQ-SF-005 [State-Driven]
**IF** 검색/필터 결과가 없는 상태이면 **THEN** 시스템은 "검색 결과가 없습니다" 메시지와 필터 초기화 버튼을 표시해야 한다.

#### REQ-SF-006 [Ubiquitous]
시스템은 **항상** 검색어와 필터 상태를 URL 쿼리 파라미터에 반영하여 공유 가능한 검색 결과 URL을 지원해야 한다.

---

### 모듈 5: 반응형 UI 및 레이아웃

#### REQ-UI-001 [Ubiquitous]
시스템은 **항상** Tailwind CSS를 사용하여 모바일 우선(Mobile-First) 반응형 레이아웃을 제공해야 한다.

#### REQ-UI-002 [Ubiquitous]
시스템은 **항상** 공통 레이아웃(Header, Footer)을 포함하는 루트 레이아웃(`src/app/layout.tsx`)을 제공해야 한다.

#### REQ-UI-003 [State-Driven]
**IF** 화면 너비가 768px 미만(모바일)이면 **THEN** 시스템은 논문 카드를 단일 열(1 column)로 표시해야 한다.

#### REQ-UI-004 [State-Driven]
**IF** 화면 너비가 768px 이상 1024px 미만(태블릿)이면 **THEN** 시스템은 논문 카드를 2열(2 columns) 그리드로 표시해야 한다.

#### REQ-UI-005 [State-Driven]
**IF** 화면 너비가 1024px 이상(데스크탑)이면 **THEN** 시스템은 논문 카드를 3열(3 columns) 그리드로 표시해야 한다.

#### REQ-UI-006 [Ubiquitous]
시스템은 **항상** Header에 서비스 로고/이름과 "논문 등록" 네비게이션 링크를 표시해야 한다.

#### REQ-UI-007 [Ubiquitous]
시스템은 **항상** Footer에 저작권 정보와 연구실 관련 정보를 표시해야 한다.

#### REQ-UI-008 [Event-Driven]
**WHEN** API 요청이 진행 중이면 **THEN** 시스템은 로딩 인디케이터(스피너 또는 스켈레톤 UI)를 표시해야 한다.

#### REQ-UI-009 [Unwanted]
폼 제출 중 네트워크 오류가 발생하면, 시스템은 사용자 친화적 에러 메시지를 표시하고 입력 데이터를 보존**해야 한다**.

---

## 4. Specifications (명세)

### 4.1 디렉터리 구조

```
bizlabsite/
├── prisma/
│   └── schema.prisma          # Prisma 데이터베이스 스키마
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 루트 레이아웃 (Header + Footer)
│   │   ├── page.tsx           # 메인 페이지 (논문 목록 + 검색)
│   │   ├── loading.tsx        # 로딩 UI
│   │   ├── error.tsx          # 에러 바운더리
│   │   ├── papers/
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # 논문 등록 페이지
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # 논문 상세 페이지
│   │   │       └── edit/
│   │   │           └── page.tsx # 논문 수정 페이지
│   │   └── api/
│   │       └── papers/
│   │           ├── route.ts   # GET (목록), POST (생성)
│   │           └── [id]/
│   │               └── route.ts # GET (상세), PUT (수정), DELETE (삭제)
│   ├── components/
│   │   ├── Header.tsx         # 헤더 컴포넌트
│   │   ├── Footer.tsx         # 푸터 컴포넌트
│   │   ├── PaperCard.tsx      # 논문 카드 컴포넌트
│   │   ├── PaperForm.tsx      # 논문 입력 폼 컴포넌트
│   │   ├── SearchBar.tsx      # 검색바 컴포넌트
│   │   └── AdminPasswordModal.tsx # 관리자 비밀번호 모달
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client 싱글톤
│   │   └── utils.ts           # 유틸리티 함수
│   └── types/
│       └── paper.ts           # TypeScript 타입 정의
├── .env                       # 환경변수 (ADMIN_PASSWORD, DATABASE_URL)
├── tailwind.config.ts         # Tailwind CSS 설정
├── tsconfig.json              # TypeScript 설정
└── package.json               # 패키지 의존성
```

### 4.2 API 명세

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/papers` | GET | 없음 | 논문 목록 조회 (query, year, sortBy, order 파라미터) |
| `/api/papers` | POST | 없음 | 논문 등록 |
| `/api/papers/[id]` | GET | 없음 | 논문 상세 조회 |
| `/api/papers/[id]` | PUT | password (body) | 논문 수정 |
| `/api/papers/[id]` | DELETE | password (body) | 논문 삭제 |

### 4.3 Prisma Schema

```prisma
model Paper {
  id        Int      @id @default(autoincrement())
  title     String
  authors   String
  year      Int
  journal   String?
  link      String?
  abstract  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.4 인증 흐름

1. 클라이언트: 수정/삭제 요청 시 관리자 비밀번호 모달 표시
2. 클라이언트: 입력된 비밀번호를 요청 본문의 `password` 필드에 포함하여 API 호출
3. 서버: `request.body.password === process.env.ADMIN_PASSWORD` 검증
4. 서버: 불일치 시 401 상태 코드 반환, 일치 시 작업 수행

---

## 5. Traceability (추적성)

| 요구사항 ID | 모듈 | 관련 파일 |
|-------------|------|-----------|
| REQ-DM-001~010 | 데이터 모델 및 API | prisma/schema.prisma, src/app/api/papers/ |
| REQ-CR-001~006 | 논문 등록/조회 | src/app/page.tsx, src/app/papers/, src/components/PaperCard.tsx, PaperForm.tsx |
| REQ-AD-001~008 | 수정/삭제 및 인증 | src/components/AdminPasswordModal.tsx, src/app/papers/[id]/edit/ |
| REQ-SF-001~006 | 검색 및 필터링 | src/components/SearchBar.tsx, src/app/page.tsx |
| REQ-UI-001~009 | 반응형 UI 및 레이아웃 | src/app/layout.tsx, src/components/Header.tsx, Footer.tsx |
