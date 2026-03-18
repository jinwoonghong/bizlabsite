# bizlabsite - 기술 스택

## 개요

bizlabsite는 연구실 논문 관리라는 명확한 목적에 맞춰, 설정이 간단하고 유지보수가 용이한 기술 스택으로 구성됩니다. 별도의 데이터베이스 서버 없이 단일 프로젝트로 프론트엔드와 백엔드를 모두 처리할 수 있는 구조입니다.

---

## 기술 스택 상세

### 프레임워크: Next.js 15 (App Router)

**선택 이유**

- 프론트엔드와 백엔드(API Route)를 하나의 프로젝트에서 통합 관리 가능
- App Router를 통한 파일 기반 라우팅으로 직관적인 페이지 구조
- Server Components를 활용한 서버 사이드 렌더링으로 초기 로딩 속도 향상
- React 생태계의 풍부한 라이브러리 활용 가능
- 별도의 백엔드 서버(Express 등)를 구축할 필요 없음

**주요 활용**

- App Router: 페이지 라우팅 및 레이아웃 관리
- Route Handlers: RESTful API 엔드포인트 구현
- Server Components: 데이터베이스 조회 및 서버 사이드 렌더링
- Client Components: 폼 입력, 검색, 모달 등 인터랙티브 UI

---

### 언어: TypeScript

**선택 이유**

- 정적 타입 검사를 통한 런타임 오류 사전 방지
- IDE 자동완성 및 리팩토링 지원으로 개발 생산성 향상
- 논문 데이터 구조(Paper 인터페이스)를 명확하게 정의
- API 요청/응답 타입을 프론트엔드와 백엔드에서 공유 가능
- Next.js에서 기본적으로 TypeScript를 지원

---

### 데이터베이스: SQLite + Prisma ORM

**SQLite 선택 이유**

- 별도의 데이터베이스 서버 설치 및 관리가 불필요
- 파일 기반 데이터베이스로 배포 및 백업이 간단
- 연구실 규모(수백~수천 건의 논문)에 충분한 성능
- 개발 환경 설정이 즉시 완료됨 (파일 하나로 동작)

**Prisma ORM 선택 이유**

- TypeScript와의 완벽한 통합으로 타입 안전한 데이터베이스 쿼리
- 직관적인 스키마 정의 언어 (schema.prisma)
- 자동 마이그레이션 관리
- Prisma Client를 통한 간결한 CRUD 작업

**데이터 모델**

Paper 모델은 다음 필드를 포함합니다:
- id: 자동 증가 정수 (Primary Key)
- title: 논문 제목 (필수)
- authors: 저자 목록 (필수)
- year: 발행연도 (필수)
- journal: 학술지/학회명 (선택)
- link: 원문 링크 URL (선택)
- abstract: 초록 (선택)
- createdAt: 등록 일시 (자동)
- updatedAt: 수정 일시 (자동)

---

### 스타일링: Tailwind CSS

**선택 이유**

- 유틸리티 퍼스트 방식으로 빠른 UI 개발
- 반응형 디자인을 위한 내장 브레이크포인트 (sm, md, lg, xl)
- 별도의 CSS 파일 관리 부담 없음
- 일관된 디자인 시스템 (색상, 간격, 타이포그래피)
- Next.js에서 기본 지원

**반응형 전략**

- 모바일 퍼스트 접근: 기본 스타일이 모바일, 브레이크포인트로 확장
- 논문 목록: 모바일에서 단일 칼럼, PC에서 카드 그리드
- 폼 레이아웃: 화면 크기에 따라 유동적으로 조정

---

### 인증 방식: 관리자 비밀번호 (환경 변수)

**선택 이유**

- 연구실 내부 서비스에 적합한 간단한 접근 제어
- 별도의 사용자 등록/로그인 시스템 구축 불필요
- 구현 복잡도를 최소화하면서도 수정/삭제 권한을 보호
- OAuth나 JWT 같은 복잡한 인증 시스템이 불필요한 규모

**구현 방식**

- 관리자 비밀번호를 `.env` 파일의 환경 변수로 설정 (예: `ADMIN_PASSWORD`)
- 논문 수정/삭제 API 호출 시 요청 본문에 비밀번호를 포함
- 서버 측에서 환경 변수의 비밀번호와 비교하여 인증
- 논문 등록은 인증 없이 허용

---

## 개발 환경 요구사항

### 필수 소프트웨어

- **Node.js**: 18.17 이상 (LTS 권장)
- **npm** 또는 **pnpm**: 패키지 관리자
- **Git**: 버전 관리

### 권장 개발 도구

- **VS Code**: TypeScript, Tailwind CSS IntelliSense 확장 프로그램 활용
- **Prisma VS Code Extension**: 스키마 파일 구문 강조 및 자동완성

### 초기 설정 절차

1. 저장소 클론 후 의존성 설치 (`npm install`)
2. `.env.example`을 `.env`로 복사하고 관리자 비밀번호 설정
3. Prisma 마이그레이션 실행 (`npx prisma migrate dev`)
4. 개발 서버 실행 (`npm run dev`)
5. 브라우저에서 `http://localhost:3000` 접속

---

## 빌드 및 배포

### 빌드

```bash
npm run build
```

Next.js가 프로젝트를 프로덕션용으로 빌드합니다. `.next/` 디렉토리에 빌드 결과물이 생성됩니다.

### 배포 옵션

#### 권장: VPS 또는 Railway

SQLite는 파일 기반 데이터베이스이므로 서버리스 환경(Vercel 등)과 호환성이 제한됩니다. 파일 시스템에 지속적으로 접근 가능한 환경이 필요합니다.

**VPS (Virtual Private Server) 배포**

- DigitalOcean, Vultr, AWS Lightsail 등
- Node.js 환경에서 `npm run start`로 직접 실행
- PM2 등의 프로세스 관리자를 사용하여 안정적으로 운영
- SQLite 파일이 서버에 영구 저장되어 데이터 유실 걱정 없음
- Nginx를 리버스 프록시로 사용하여 HTTPS 적용 가능

**Railway 배포**

- Git push 기반의 자동 배포
- 영구 볼륨(Persistent Volume)을 지원하여 SQLite 파일 유지 가능
- 설정이 간단하고 무료 플랜으로 시작 가능

**Docker 배포**

- Dockerfile을 작성하여 컨테이너화
- SQLite 파일을 볼륨 마운트로 영구 저장
- 어떤 환경에서든 동일하게 동작

#### 비권장: Vercel

- Vercel은 서버리스 함수 기반으로 동작하여 SQLite 파일 시스템 접근이 제한됨
- 함수 실행 간에 파일 시스템이 공유되지 않아 데이터 일관성 문제 발생
- SQLite 대신 PostgreSQL(Vercel Postgres 등)로 전환하면 Vercel 배포 가능

---

## 주요 의존성 패키지

| 패키지 | 용도 |
|--------|------|
| next | 풀스택 React 프레임워크 |
| react, react-dom | UI 라이브러리 |
| typescript | 정적 타입 언어 |
| @prisma/client | 데이터베이스 ORM 클라이언트 |
| prisma | 스키마 관리 및 마이그레이션 CLI |
| tailwindcss | 유틸리티 퍼스트 CSS 프레임워크 |

### 개발 의존성

| 패키지 | 용도 |
|--------|------|
| @types/node | Node.js 타입 정의 |
| @types/react | React 타입 정의 |
| eslint | 코드 린팅 |
| eslint-config-next | Next.js ESLint 설정 |
| postcss | CSS 후처리 (Tailwind 빌드에 필요) |

---

## 기술적 고려사항

### 성능

- Server Components를 활용하여 클라이언트로 전송되는 JavaScript 최소화
- SQLite는 읽기 작업에 매우 빠르며, 논문 목록 조회에 최적
- Tailwind CSS의 Purge 기능으로 사용하지 않는 CSS 제거

### 확장성

- 논문 수가 수만 건을 초과하는 경우, SQLite에서 PostgreSQL로 전환을 고려
- Prisma를 사용하므로 데이터베이스 전환 시 스키마 변경만으로 마이그레이션 가능
- 사용자 인증이 필요해지면 NextAuth.js 도입 가능

### 보안

- 관리자 비밀번호는 환경 변수로 관리하여 코드에 포함하지 않음
- API Route에서 입력값 검증 수행
- SQL Injection은 Prisma ORM이 자동으로 방지
- `.env` 파일은 `.gitignore`에 포함하여 버전 관리에서 제외
