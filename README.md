# 브리카(BRIKKA) 임대 관리 플랫폼

건물·유닛·임대차 계약을 한 곳에서 관리하는 부동산 임대 운영 플랫폼입니다.
입주자 모집을 위한 **브랜드 랜딩 사이트**, 관리사(매니저)를 위한 **관리자 백오피스**, 임대인·입주자를 위한 **포털**을 하나의 모노레포에서 운영합니다.

- **모노레포**: Turborepo + pnpm workspaces
- **프레임워크**: Next.js 15 (App Router, React 19, Server Components 기본)
- **데이터베이스**: PostgreSQL + Prisma ORM
- **인증**: NextAuth v5 (Credentials, JWT 세션)
- **UI**: Tailwind CSS v4 + shadcn/ui 기반 자체 디자인 시스템
- **스토리지**: AWS S3 (공개/비공개 버킷 분리, presigned URL)
- **메일**: React Email + Resend
- **린트/포맷**: Biome + Ultracite

---

## 시스템 구성

| 앱 | 포트 | 설명 |
| --- | --- | --- |
| `apps/web` | 3000 | 브리카 브랜드 랜딩 사이트. 홈 / 리빙 / 오피스 소개, 투어(방문) 예약 문의, 입주자 로그인 진입점 |
| `apps/admin` | 3001 | 관리자 백오피스 + 임대인 포털 + 입주자 포털. 권한(Role)에 따라 사이드바와 접근 범위가 분기 |
| `apps/email` | 3003 | React Email 템플릿 프리뷰 개발 서버 |

### 공유 패키지

| 패키지 | 설명 |
| --- | --- |
| `@repo/database` | Prisma 스키마 및 클라이언트. **모든 DB 접근은 이 패키지를 통해서만** 수행 |
| `@repo/design-system` | shadcn/ui 기반 공통 UI 컴포넌트, 폰트, 테마 프로바이더 |
| `@repo/editor` | Tiptap 기반 리치 텍스트 에디터. 리치 콘텐츠 입력용으로 준비되어 있으며 현재 앱에서는 미연결 |
| `@repo/email` | Resend 발송 클라이언트 및 이메일 템플릿 |
| `@repo/common` | 앱 간 공용 타입(`Result`, `Paged`, 에러 코드/메시지)과 포매터 유틸 |
| `@repo/seo` | 메타데이터 · JSON-LD 스키마 생성 유틸 |
| `@repo/analytics` | Google Analytics / Vercel Analytics 연동 |
| `@repo/next-config` | Next.js 공통 설정 및 환경변수 스키마 |
| `@repo/typescript-config` | 워크스페이스 공통 `tsconfig` |

---

## 주요 기능

### 관리자 (ADMIN / MANAGER)

- **대시보드** — 계약·청구·요청 현황 요약
- **임대 계약** — 계약 목록, 신규 계약 등록(계약자·입주자·차량·반려동물·외국인·법인·중개사 정보), 계약 상태 관리(준비중 → 진행중 → 종료/해지), 원장 조회
- **청구·수납** — 청구 스케줄(월/분기/연 반복 또는 1회성) 기반 청구서 발행, 미납·연체 관리, 수납 내역 기록
- **건물 관리** — 건물/유닛 등록, 공용·전용 시설, 주차 구획, 가전·가구 자산, 소유권(임대인) 관리, 첨부문서
- **요청 관리** — 민원·제안·문의·수선 요청 접수(입주자/임대인/대면/내부), 우선순위 및 처리 상태 추적
- **사용자 및 계정** — 관리자·입주자·임대인 목록, 세분화된 권한(`UserPermissionType`) 부여
- **알림·공지** — 알림톡/이메일/SMS 채널 직접 발송, 자동 발송 설정, 발송 이력
- **문서 관리** — 계약서·신분증 등 첨부파일 등록 및 일괄 다운로드(zip)
- **변경 이력** — 주요 엔티티의 변경 내역 감사 로그
- **홈페이지·문의 관리** — 랜딩 사이트 노출 콘텐츠 및 투어 예약 문의 접수/운영 시간 설정

### 임대인 포털 (LANDLORD)

건물 및 유닛 정보, 위임 계약서, 계약 현황, 공지, 정산 보고서 조회

### 입주자 포털 (TENANT)

계약 정보, 정산 내역 통합 조회, 요청 접수, 알림·공지 확인, 내 정보 수정

---

## 요구 사항

- Node.js `>= 18`
- pnpm `10.11.1` (`packageManager` 필드로 고정)
- PostgreSQL 데이터베이스
- AWS S3 버킷 (파일 업로드용)

pnpm이 없다면 Corepack으로 활성화합니다.

```bash
corepack enable
corepack prepare pnpm@10.11.1 --activate
```

---

## 빠른 시작

```bash
corepack enable && corepack prepare pnpm@10.11.1 --activate  # pnpm 준비 (최초 1회)
pnpm install                                                 # 의존성 설치
cp apps/web/.env.example   apps/web/.env.local               # 환경변수 템플릿 복사
cp apps/admin/.env.example apps/admin/.env.local
pnpm migrate                                                 # Prisma 스키마 DB 반영
pnpm dev                                                     # 전체 앱 개발 서버 실행
```

실행 후 접속 주소: 랜딩 <http://localhost:3000> · 관리자 <http://localhost:3001> · 이메일 프리뷰 <http://localhost:3003>

> ⚠️ `.env.example`은 현재 스키마보다 오래되어 **누락된 키가 있습니다.** 복사 후 아래 표를 기준으로 값을 채워 넣으세요.
> 특히 `apps/admin`은 `ENCRYPTION_KEY`·`AWS_*` 계열이, `apps/web`은 `NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL`·`NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY`가 빠져 있습니다.
> 또한 `apps/admin/.env.example`에는 예시용 `AUTH_SECRET` 값이 그대로 들어 있으므로 **운영 배포 시 반드시 새로 생성**하세요 (`openssl rand -base64 32`).

### 환경변수

각 앱 루트에 `.env.local`을 생성합니다. 스키마는 `apps/*/env.ts`, `packages/*/keys.ts`에 zod로 정의되어 있어 누락 시 부팅 단계에서 실패합니다.

**공통 (`packages/database`)**

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 접속 URL |

**`apps/web`**

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 접속 URL |
| `NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL` | 입주자 로그인 페이지(admin) URL |
| `NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY` | 카카오 지도 JavaScript 키 |

**`apps/admin`**

| 변수 | 설명 |
| --- | --- |
| `AUTH_SECRET` | NextAuth 세션 서명 키 |
| `ENCRYPTION_KEY` | 주민등록번호 등 민감정보 암복호화 키 |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3 자격증명 |
| `NEXT_PUBLIC_AWS_BUCKET` | 공개 파일 버킷 |
| `AWS_BUCKET_PRIVATE` | 비공개 파일 버킷 (presigned URL로 접근) |

**이메일 발송 (`packages/email`) — 사용 시**

| 변수 | 설명 |
| --- | --- |
| `RESEND_TOKEN` | Resend API 토큰 (`re_` 접두사) |
| `RESEND_FROM` | 발신자 이메일 주소 |
| `USER_PORTAL_URL` | 메일 본문에 삽입할 포털 URL |

**분석 (`packages/analytics`) — 선택**

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 측정 ID (`G-` 접두사) |

---

## 명령어 모음

모든 명령은 **저장소 루트**에서 실행합니다. 개별 앱/패키지 단위 실행이 필요하면 `--filter`를 사용합니다.

### 개발 서버

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 모든 앱을 동시에 개발 모드로 실행 |
| `pnpm web` | 랜딩 사이트만 실행 — <http://localhost:3000> |
| `pnpm admin` | 관리자/포털만 실행 — <http://localhost:3001> |
| `pnpm turbo dev --filter email` | 이메일 템플릿 프리뷰 — <http://localhost:3003> |

### 빌드 · 실행

| 명령어 | 설명 |
| --- | --- |
| `pnpm build` | 전체 워크스페이스 빌드. `turbo.json` 설정상 **`test`가 선행**됩니다 |
| `pnpm turbo build --filter web` | 특정 앱만 빌드 (`web` / `admin` / `email`) |
| `pnpm --filter admin start` | 빌드 결과물로 프로덕션 서버 실행 |
| `pnpm analyze` | 번들 사이즈 분석 (`ANALYZE=true`로 빌드) |

### 데이터베이스 (Prisma)

| 명령어 | 설명 |
| --- | --- |
| `pnpm migrate` | `prisma format` → `generate` → `db push` 일괄 실행 |
| `pnpm turbo build --filter @repo/database` | Prisma Client만 재생성 |
| `cd packages/database && npx prisma studio` | Prisma Studio로 데이터 직접 조회/편집 |
| `cd packages/database && npx prisma db pull` | 기존 DB 스키마를 역으로 가져오기 |

> 스키마: `packages/database/prisma/schema.prisma` · 생성물: `packages/database/generated/client`
> `relationMode = "prisma"`로 설정되어 있어 외래키 제약은 애플리케이션 레벨에서 처리됩니다.

### 코드 품질

| 명령어 | 설명 |
| --- | --- |
| `pnpm lint` | Ultracite(Biome) 린트 검사 |
| `pnpm format` | Ultracite(Biome) 자동 포맷팅 |
| `pnpm test` | 전체 테스트 실행 (Vitest) |
| `pnpm -r typecheck` | 공유 패키지 타입 검사 (`tsc --noEmit`) |

> `turbo.json`에 정의된 태스크는 `build` / `test` / `analyze` / `dev` / `translate` / `clean` 입니다.
> `start`·`typecheck`처럼 여기에 없는 스크립트는 `turbo` 대신 `pnpm --filter` 또는 `pnpm -r`로 실행하세요.

### 유지보수

| 명령어 | 설명 |
| --- | --- |
| `pnpm bump-deps` | 의존성 일괄 업데이트 (`react-day-picker` 제외) |
| `pnpm bump-ui` | shadcn UI 컴포넌트 전체 갱신 |
| `pnpm turbo gen init` | 신규 공유 패키지 스캐폴딩 (`packages/<name>` 생성) |
| `pnpm clean` | 빌드 산출물 및 `node_modules` 정리 — **아래 주의 참고** |

> ⚠️ `clean` 계열 스크립트는 `git clean -xdf`를 사용하므로 **Git 저장소로 초기화되지 않은 상태에서는 동작하지 않습니다.**
> `git init` 후 사용하거나, 아래 명령으로 직접 정리하세요.
>
> ```bash
> find . \( -name node_modules -o -name .turbo -o -name .next \) -type d -prune -exec rm -rf {} +
> ```

---

## 프로젝트 구조

```
.
├── apps/
│   ├── web/                    # 브랜드 랜딩 사이트
│   │   ├── @actions/           # Server Actions
│   │   ├── @data/              # 정적 콘텐츠 데이터 (소개 섹션, FAQ 등)
│   │   ├── app/(pages)/        # 홈 / living / office / book
│   │   └── components/
│   ├── admin/                  # 관리자 백오피스 + 포털
│   │   ├── @actions/           # 도메인별 Server Actions
│   │   ├── @data/              # 조회 계층 / 매퍼
│   │   ├── app/(private)/      # 인증 필요 라우트
│   │   ├── auth.ts             # NextAuth 설정
│   │   └── middleware.ts       # 인증 미들웨어
│   └── email/                  # React Email 프리뷰
├── packages/
│   ├── database/prisma/schema.prisma
│   ├── design-system/
│   ├── editor/  common/  email/  seo/  analytics/
│   ├── next-config/
│   └── typescript-config/
├── turbo/generators/           # 신규 패키지 스캐폴딩 템플릿
├── biome.json
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 데이터 모델 개요

`packages/database/prisma/schema.prisma`에 약 30개 모델이 정의되어 있으며, 모든 필드에 한글 주석이 달려 있습니다.

```
User ─┬─ UserPermission            사용자 / 세분화 권한
      ├─ BuildingOwnership ── Building ─┬─ Unit ── Lease ─┬─ LeaseTenant
      │                                  ├─ BuildingFacility ── Facility
      │                                  ├─ ParkingSpace
      │                                  └─ BuildingApplianceFurniture
      ├─ Request                          민원·수선 요청
      ├─ Message / AlarmConfig            알림 발송 및 자동 발송 설정
      └─ ChangeHistory                    변경 이력 감사

Lease ─┬─ LeaseBillingSchedule ── Bill ── Payment    청구 스케줄 → 청구 → 수납
       ├─ LeaseContractor / LeaseVehicle / LeasePet
       ├─ LeaseBroker / LeaseForeigner / Company
       └─ LeaseNotificationSetting

Attachment ── File                        건물·유닛·계약 첨부파일 통합
Contact / ContactConfig                   랜딩 사이트 투어 예약 문의
```

주요 열거형: `UserRole`(ADMIN/MANAGER/TENANT/LANDLORD), `UnitStatus`(공실/입주중/예약중/공사중), `LeaseStatus`(준비중/진행중/종료/해지), `BillStatus`(납부완료/미납/연체), `RequestType`·`RequestStatus`·`RequestPriority`, `NotificationChannel`(알림톡/이메일/SMS)

---

## 개발 컨벤션

### Server Actions

- 앱별 `@actions/` 아래에 **도메인 단위 폴더 + `동사+명사` camelCase 파일**로 작성합니다. (예: `@actions/lease/createLease.ts`)
- 파일 최상단에 `'use server'`를 선언합니다.
- **입력 검증 → 권한 검사 → 도메인 로직/트랜잭션 → 캐시 무효화/반환** 순서를 지킵니다.
- 반환은 `Result<T>` 패턴(`{ ok: true, data }` / `{ ok: false, code, message }`)으로 통일하고, 직렬화 가능한 값만 돌려줍니다.
- 원시 에러를 외부에 노출하지 않고 `VALIDATION_ERROR` / `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `CONFLICT` / `INTERNAL_ERROR` 코드로 변환합니다.

```ts
'use server';

import { type Prisma, database } from '@repo/database';
import type { Result } from '@repo/common/types';
import { auth } from '@/auth';

export async function createLease(
  input: Prisma.LeaseUncheckedCreateInput
): Promise<Result<{ id: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' };
  }

  try {
    const lease = await database.$transaction((tx) =>
      tx.lease.create({ data: input, select: { id: true } })
    );
    return { ok: true, data: { id: lease.id.toString() } };
  } catch (e) {
    console.error('[createLease] error', e);
    return { ok: false, code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' };
  }
}
```

### 데이터베이스

- 앱에서 Prisma Client를 직접 생성하지 않고 `import { type Prisma, database } from '@repo/database'`로만 접근합니다.
- 여러 변경 작업은 트랜잭션으로 묶고, 외부 API 호출은 트랜잭션 밖에서 처리합니다.
- 목록 조회는 `take/skip` 또는 커서 기반 페이지네이션을 사용하고, 반환은 `Paged<T>`(`@repo/common/types`)로 통일합니다. `where`/`orderBy` 대상 컬럼에는 인덱스를 설계합니다.
- `include`로 N+1을 방지하고, 대량 작업은 `createMany`/`updateMany`를 사용합니다.

### UI 컴포넌트

- 기본 컴포넌트는 `@repo/design-system/components/ui/*`(shadcn 기반), 확장 컴포넌트는 `@repo/design-system/components/*`에서 가져옵니다.
- 조건부 클래스는 `cn`(`@repo/design-system/lib/utils`)을 사용합니다.
- 아이콘은 `lucide-react` 기본, `@tabler/icons-react` 보조. 기본 크기 `w-5 h-5`.
- 사용자 피드백은 `sonner`의 `toast`로 통일합니다.
- 컴포넌트명은 PascalCase, 디렉터리는 소문자 + 하이픈.

### 디렉터리 규칙

- 공통 컴포넌트는 `_components/`, 공통 훅은 `_hooks/`, 유틸/상수는 `lib/`에 둡니다.
- 특정 페이지·도메인 전용 리소스는 `{scope}/_components/`, `{scope}/_hooks/`처럼 스코프 하위에 둡니다.

---

## 배포

Vercel 배포를 전제로 구성되어 있습니다(`apps/*/vercel.json`). 각 앱을 별도 Vercel 프로젝트로 연결하고, Root Directory를 해당 앱 경로로 지정한 뒤 위의 환경변수를 등록합니다.

빌드 파이프라인은 `turbo.json`에 정의되어 있으며, `build`는 `test`와 상위 패키지 빌드에 의존합니다.
