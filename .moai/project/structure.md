# bizlabsite - 프로젝트 구조

## 개요

Next.js App Router 기반의 풀스택 웹 애플리케이션 구조입니다. 프론트엔드와 백엔드(API)가 하나의 프로젝트에 통합되어 있으며, SQLite를 데이터베이스로 사용합니다.

---

## 디렉토리 구조

```
bizlabsite/
├── src/
│   ├── app/                      # Next.js App Router (페이지 및 API)
│   │   ├── layout.tsx            # 루트 레이아웃 (공통 HTML 구조, 폰트, 메타데이터)
│   │   ├── page.tsx              # 홈 페이지 (논문 목록 및 검색)
│   │   ├── globals.css           # 전역 스타일 (Tailwind 지시어 포함)
│   │   ├── papers/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # 논문 등록 페이지
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 논문 상세 페이지
│   │   │       └── edit/
│   │   │           └── page.tsx  # 논문 수정 페이지
│   │   └── api/
│   │       └── papers/
│   │           ├── route.ts      # GET (목록 조회), POST (등록) API
│   │           └── [id]/
│   │               └── route.ts  # GET (단건 조회), PUT (수정), DELETE (삭제) API
│   ├── components/               # 재사용 가능한 React 컴포넌트
│   │   ├── PaperCard.tsx         # 논문 카드 컴포넌트 (목록용)
│   │   ├── PaperForm.tsx         # 논문 등록/수정 폼 컴포넌트
│   │   ├── SearchBar.tsx         # 검색바 컴포넌트
│   │   ├── AdminPasswordModal.tsx # 관리자 비밀번호 입력 모달
│   │   ├── Header.tsx            # 헤더 네비게이션
│   │   └── Footer.tsx            # 푸터
│   ├── lib/                      # 유틸리티 및 서버 로직
│   │   ├── prisma.ts             # Prisma 클라이언트 인스턴스 (싱글턴)
│   │   └── utils.ts              # 공통 유틸리티 함수
│   └── types/                    # TypeScript 타입 정의
│       └── paper.ts              # 논문 관련 타입/인터페이스
├── prisma/
│   ├── schema.prisma             # Prisma 스키마 (데이터 모델 정의)
│   ├── dev.db                    # SQLite 데이터베이스 파일 (개발용)
│   └── migrations/               # 데이터베이스 마이그레이션 히스토리
├── public/                       # 정적 파일 (이미지, 파비콘 등)
├── .env                          # 환경 변수 (관리자 비밀번호, DB 경로 등)
├── .env.example                  # 환경 변수 예시 파일
├── tailwind.config.ts            # Tailwind CSS 설정
├── next.config.ts                # Next.js 설정
├── package.json                  # 패키지 의존성 및 스크립트
├── tsconfig.json                 # TypeScript 설정
└── .gitignore                    # Git 제외 파일 목록
```

---

## 디렉토리별 상세 설명

### src/app/ - 페이지 및 API 라우트

Next.js App Router의 파일 기반 라우팅을 활용합니다. 디렉토리 구조가 곧 URL 경로가 됩니다.

| 경로 | URL | 용도 |
|------|-----|------|
| `app/page.tsx` | `/` | 메인 페이지 - 논문 목록 및 검색 |
| `app/papers/new/page.tsx` | `/papers/new` | 논문 등록 폼 |
| `app/papers/[id]/page.tsx` | `/papers/:id` | 논문 상세 정보 |
| `app/papers/[id]/edit/page.tsx` | `/papers/:id/edit` | 논문 수정 폼 |
| `app/api/papers/route.ts` | `GET /api/papers` | 논문 목록 조회 + 검색 |
| `app/api/papers/route.ts` | `POST /api/papers` | 논문 등록 |
| `app/api/papers/[id]/route.ts` | `GET /api/papers/:id` | 논문 단건 조회 |
| `app/api/papers/[id]/route.ts` | `PUT /api/papers/:id` | 논문 수정 (비밀번호 필요) |
| `app/api/papers/[id]/route.ts` | `DELETE /api/papers/:id` | 논문 삭제 (비밀번호 필요) |

### src/components/ - 공통 컴포넌트

페이지 간에 재사용되는 UI 컴포넌트를 관리합니다.

- **PaperCard.tsx**: 논문 목록에서 각 논문을 표시하는 카드 형태의 컴포넌트. 제목, 저자, 연도, 학술지명을 간략히 보여줌
- **PaperForm.tsx**: 논문 등록과 수정에서 공통으로 사용하는 폼 컴포넌트. 등록 모드와 수정 모드를 props로 구분
- **SearchBar.tsx**: 키워드 검색과 연도 필터를 제공하는 검색 인터페이스
- **AdminPasswordModal.tsx**: 수정/삭제 시 관리자 비밀번호를 입력받는 모달 대화상자
- **Header.tsx**: 사이트 제목과 네비게이션 링크를 포함하는 헤더
- **Footer.tsx**: 저작권 정보 등을 포함하는 푸터

### src/lib/ - 유틸리티 및 서버 로직

서버 사이드에서 사용되는 공통 로직과 유틸리티 함수를 관리합니다.

- **prisma.ts**: Prisma 클라이언트의 싱글턴 인스턴스. 개발 환경에서 핫 리로드 시 연결 중복을 방지
- **utils.ts**: 날짜 포맷팅, 입력값 검증 등 공통 유틸리티 함수

### src/types/ - 타입 정의

TypeScript 인터페이스와 타입을 중앙 관리합니다.

- **paper.ts**: Paper 인터페이스, API 요청/응답 타입, 폼 데이터 타입 등 논문 관련 타입 정의

### prisma/ - 데이터베이스

Prisma ORM을 통한 데이터베이스 관리 디렉토리입니다.

- **schema.prisma**: Paper 모델 정의 (id, title, authors, year, journal, link, abstract, createdAt, updatedAt)
- **dev.db**: SQLite 데이터베이스 파일. 별도의 데이터베이스 서버 설치가 불필요
- **migrations/**: 스키마 변경 히스토리를 추적하는 마이그레이션 파일

### public/ - 정적 자원

이미지, 파비콘 등 정적 파일을 관리합니다. Next.js에서 `/` 경로로 직접 접근 가능합니다.

---

## 모듈 구성 원칙

### 관심사 분리

- **페이지 (app/)**: 라우팅과 페이지 렌더링에만 집중
- **컴포넌트 (components/)**: 재사용 가능한 UI 단위로 분리
- **서버 로직 (lib/)**: 데이터베이스 연결, 유틸리티 등 서버 측 로직
- **타입 (types/)**: 프론트엔드와 백엔드가 공유하는 타입 정의
- **데이터 (prisma/)**: 데이터 모델과 마이그레이션

### 네이밍 컨벤션

- 컴포넌트 파일: PascalCase (예: `PaperCard.tsx`)
- 유틸리티 파일: camelCase (예: `prisma.ts`, `utils.ts`)
- 타입 파일: camelCase (예: `paper.ts`)
- API 라우트: `route.ts` (Next.js App Router 규칙)
- 페이지: `page.tsx` (Next.js App Router 규칙)
- 레이아웃: `layout.tsx` (Next.js App Router 규칙)

### 확장 시 고려사항

프로젝트가 확장될 경우 다음과 같은 디렉토리를 추가로 생성할 수 있습니다:

- `src/hooks/`: 커스텀 React 훅 (예: `usePapers.ts`, `useSearch.ts`)
- `src/constants/`: 상수 값 정의 (예: 검색 필터 옵션, 페이지네이션 설정)
- `src/services/`: API 호출 래퍼 함수 (프론트엔드에서 API 호출을 추상화)
