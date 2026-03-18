---
id: SPEC-MVP-001
type: plan
version: "1.0.0"
created: "2026-03-17"
updated: "2026-03-17"
---

# SPEC-MVP-001 구현 계획서

## 1. 구현 개요

bizlabsite MVP는 연구실 논문 관리 웹 서비스로, Next.js 15 App Router 기반의 풀스택 애플리케이션이다. 총 5개 모듈을 우선순위 기반 마일스톤으로 구현한다.

---

## 2. 기술 스택 및 라이브러리 버전

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| next | ^15.0.0 | React 풀스택 프레임워크 (App Router) |
| react | ^19.0.0 | UI 라이브러리 |
| react-dom | ^19.0.0 | React DOM 렌더링 |
| typescript | ^5.5.0 | 정적 타입 시스템 |
| prisma | ^6.0.0 | ORM (CLI + Client) |
| @prisma/client | ^6.0.0 | Prisma Client 런타임 |
| tailwindcss | ^4.0.0 | 유틸리티 기반 CSS 프레임워크 |
| @tailwindcss/postcss | ^4.0.0 | PostCSS 통합 |

### 개발 의존성

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| eslint | ^9.0.0 | 코드 린팅 |
| eslint-config-next | ^15.0.0 | Next.js ESLint 설정 |
| @types/node | ^22.0.0 | Node.js 타입 정의 |
| @types/react | ^19.0.0 | React 타입 정의 |

---

## 3. 마일스톤 (우선순위 기반)

### Primary Goal: 데이터 기반 구축 (모듈 1)

**관련 요구사항**: REQ-DM-001 ~ REQ-DM-010

**작업 목록**:

1. 프로젝트 초기 설정
   - `create-next-app`으로 Next.js 15 프로젝트 생성 (TypeScript, Tailwind CSS, App Router)
   - Prisma 초기화 (`npx prisma init --datasource-provider sqlite`)
   - `.env` 파일 구성 (`DATABASE_URL`, `ADMIN_PASSWORD`)
   - `tsconfig.json` path alias 설정 (`@/` -> `src/`)

2. 데이터베이스 스키마 정의
   - `prisma/schema.prisma` 에 Paper 모델 작성
   - `npx prisma db push`로 SQLite 데이터베이스 생성
   - Prisma Client 생성 (`npx prisma generate`)

3. Prisma Client 싱글톤 설정
   - `src/lib/prisma.ts` 작성 (개발환경 글로벌 캐시 패턴)

4. TypeScript 타입 정의
   - `src/types/paper.ts` 작성 (Paper, CreatePaperInput, UpdatePaperInput 타입)

5. API Route 구현
   - `src/app/api/papers/route.ts`: GET (목록 + 검색/필터/정렬), POST (생성 + 검증)
   - `src/app/api/papers/[id]/route.ts`: GET (상세), PUT (수정 + 비밀번호 검증), DELETE (삭제 + 비밀번호 검증)
   - 입력값 검증 로직 (필수 필드, URL 형식)
   - 에러 응답 표준화 (400, 401, 404)

**산출물**: API 엔드포인트 전체 동작, 데이터베이스 CRUD 완료

**의존성**: 없음 (최초 작업)

---

### Secondary Goal: 핵심 UI 구현 (모듈 2 + 모듈 5)

**관련 요구사항**: REQ-CR-001 ~ REQ-CR-006, REQ-UI-001 ~ REQ-UI-009

**작업 목록**:

1. 공통 레이아웃 구현
   - `src/app/layout.tsx`: 루트 레이아웃 (HTML 구조, 폰트, 메타데이터)
   - `src/components/Header.tsx`: 서비스 로고/이름, 네비게이션 (메인, 논문 등록)
   - `src/components/Footer.tsx`: 저작권, 연구실 정보
   - `src/app/loading.tsx`: 전역 로딩 UI
   - `src/app/error.tsx`: 전역 에러 바운더리

2. 메인 페이지 (논문 목록)
   - `src/app/page.tsx`: Server Component로 논문 목록 조회 및 렌더링
   - `src/components/PaperCard.tsx`: 논문 카드 컴포넌트 (제목, 저자, 연도, 저널)
   - 반응형 그리드: 1열(모바일) / 2열(태블릿) / 3열(데스크탑)
   - 빈 목록 상태 처리 ("등록된 논문이 없습니다")

3. 논문 등록 페이지
   - `src/app/papers/new/page.tsx`: 등록 페이지
   - `src/components/PaperForm.tsx`: 재사용 가능한 폼 컴포넌트 (등록/수정 공용)
   - 클라이언트 측 폼 검증 (필수 필드, URL 형식)
   - 제출 후 메인 페이지 리다이렉트

4. 논문 상세 페이지
   - `src/app/papers/[id]/page.tsx`: 논문 전체 메타데이터 표시
   - 원문 링크 외부 탭 열기 (`target="_blank"`, `rel="noopener noreferrer"`)
   - 수정/삭제 버튼 표시

5. 유틸리티 함수
   - `src/lib/utils.ts`: 날짜 포맷, URL 검증, 에러 메시지 처리

**산출물**: 전체 페이지 UI, 반응형 레이아웃, 기본 네비게이션

**의존성**: Primary Goal (API 완료 필요)

---

### Tertiary Goal: 관리자 기능 구현 (모듈 3)

**관련 요구사항**: REQ-AD-001 ~ REQ-AD-008

**작업 목록**:

1. 관리자 비밀번호 모달
   - `src/components/AdminPasswordModal.tsx`: 비밀번호 입력, 확인/취소 버튼
   - 에러 메시지 표시 (비밀번호 불일치)
   - ESC 키 / 배경 클릭으로 닫기

2. 논문 수정 페이지
   - `src/app/papers/[id]/edit/page.tsx`: 기존 데이터 프리필 폼
   - PaperForm 컴포넌트 재사용 (mode: "edit")
   - 비밀번호 포함 PUT 요청 전송
   - 성공 시 상세 페이지 리다이렉트

3. 논문 삭제 기능
   - 삭제 확인 + 비밀번호 입력 통합 모달
   - 비밀번호 포함 DELETE 요청 전송
   - 성공 시 메인 페이지 리다이렉트

**산출물**: 관리자 인증 기반 수정/삭제 기능

**의존성**: Secondary Goal (UI 컴포넌트 완료 필요)

---

### Final Goal: 검색 및 필터링 (모듈 4)

**관련 요구사항**: REQ-SF-001 ~ REQ-SF-006

**작업 목록**:

1. 검색바 컴포넌트
   - `src/components/SearchBar.tsx`: 키워드 입력, 연도 필터 드롭다운, 정렬 옵션
   - 디바운스 적용 (300ms)
   - URL 쿼리 파라미터 동기화 (`useSearchParams`)

2. 메인 페이지 검색 통합
   - `src/app/page.tsx` 에 SearchBar 통합
   - Server Component에서 쿼리 파라미터 기반 데이터 조회
   - 검색 결과 없음 상태 처리

3. API 검색 로직 강화
   - GET `/api/papers` 에 `query`, `year`, `sortBy`, `order` 파라미터 처리
   - Prisma `where` 조건: `contains` (제목, 저자, 저널), `equals` (연도)
   - Prisma `orderBy`: `createdAt`, `year`, `title`

**산출물**: 검색, 필터링, 정렬 기능 완성

**의존성**: Secondary Goal (메인 페이지 UI 완료 필요)

---

## 4. 생성/수정 파일 목록

### 신규 생성 파일

| 파일 경로 | 설명 |
|-----------|------|
| `prisma/schema.prisma` | Paper 모델 스키마 |
| `src/app/layout.tsx` | 루트 레이아웃 |
| `src/app/page.tsx` | 메인 페이지 (논문 목록 + 검색) |
| `src/app/loading.tsx` | 전역 로딩 UI |
| `src/app/error.tsx` | 전역 에러 바운더리 |
| `src/app/papers/new/page.tsx` | 논문 등록 페이지 |
| `src/app/papers/[id]/page.tsx` | 논문 상세 페이지 |
| `src/app/papers/[id]/edit/page.tsx` | 논문 수정 페이지 |
| `src/app/api/papers/route.ts` | 논문 목록/등록 API |
| `src/app/api/papers/[id]/route.ts` | 논문 상세/수정/삭제 API |
| `src/components/Header.tsx` | 헤더 컴포넌트 |
| `src/components/Footer.tsx` | 푸터 컴포넌트 |
| `src/components/PaperCard.tsx` | 논문 카드 컴포넌트 |
| `src/components/PaperForm.tsx` | 논문 입력 폼 |
| `src/components/SearchBar.tsx` | 검색바 컴포넌트 |
| `src/components/AdminPasswordModal.tsx` | 관리자 비밀번호 모달 |
| `src/lib/prisma.ts` | Prisma Client 싱글톤 |
| `src/lib/utils.ts` | 유틸리티 함수 |
| `src/types/paper.ts` | TypeScript 타입 정의 |
| `.env` | 환경변수 설정 |

### 수정 파일

| 파일 경로 | 설명 |
|-----------|------|
| `package.json` | Prisma 의존성 추가 |
| `tsconfig.json` | Path alias 확인/수정 |
| `tailwind.config.ts` | 필요 시 커스텀 설정 |

---

## 5. 아키텍처 설계 방향

### 5.1 컴포넌트 아키텍처

```
Server Components (기본)
├── layout.tsx (루트 레이아웃)
├── page.tsx (메인 - 데이터 페칭)
├── papers/[id]/page.tsx (상세 - 데이터 페칭)
└── papers/new/page.tsx (등록 - 래퍼)

Client Components ('use client')
├── PaperForm.tsx (폼 상태 관리)
├── SearchBar.tsx (검색 상태 + URL 동기화)
├── AdminPasswordModal.tsx (모달 상태)
├── PaperCard.tsx (클릭 이벤트)
└── error.tsx (에러 바운더리)
```

### 5.2 데이터 흐름

- **조회**: Server Component -> Prisma 직접 쿼리 -> RSC 렌더링
- **생성**: Client Component -> `fetch('/api/papers', { method: 'POST' })` -> API Route -> Prisma
- **수정/삭제**: Client Component -> 비밀번호 모달 -> `fetch('/api/papers/[id]', { method: 'PUT/DELETE' })` -> API Route -> 비밀번호 검증 -> Prisma

### 5.3 Server Component vs Client Component 전략

- **Server Component 우선**: 데이터 페칭이 필요한 페이지는 Server Component로 구현하여 번들 크기 최소화
- **Client Component 최소화**: 사용자 인터랙션이 필요한 컴포넌트만 `'use client'` 지시문 사용
- **Composition 패턴**: Server Component에서 Client Component를 children으로 전달하여 서버/클라이언트 경계 최적화

---

## 6. 리스크 분석 및 대응

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|-----------|
| SQLite 동시 쓰기 제한 | 중 | 낮 | 연구실 규모에서는 문제 없음. 추후 PostgreSQL 마이그레이션 경로 확보 |
| Tailwind CSS v4 호환성 이슈 | 중 | 중 | v4 이슈 발생 시 v3.4.x 로 다운그레이드 가능 |
| 비밀번호 평문 전송 | 중 | 중 | MVP에서는 HTTPS 적용으로 대응. 추후 해싱 기반 인증 고려 |
| Prisma 콜드 스타트 지연 | 낮 | 낮 | 싱글톤 패턴으로 재사용, 연결 풀링 불필요 (SQLite) |
| Next.js 15 App Router 변경사항 | 낮 | 중 | 공식 문서 기반 구현, stable API만 사용 |

---

## 7. 구현 원칙

- **Server Component 우선**: 가능한 한 Server Component로 구현하여 클라이언트 번들 최소화
- **점진적 향상**: 기본 HTML 폼 동작을 기반으로 JavaScript 인터랙션 추가
- **단일 책임 원칙**: 각 컴포넌트는 하나의 역할만 수행
- **타입 안전성**: 모든 데이터 흐름에 TypeScript 타입 적용
- **에러 처리**: 모든 API 호출에 try-catch 적용, 사용자 친화적 에러 메시지 제공
