// Server Actions 공통 타입 정의

export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; code?: string; message: string };
export type Result<T> = Ok<T> | Err;

// 에러 코드 상수
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// 공통 에러 메시지
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '데이터 충돌이 발생했습니다.',
  INTERNAL_ERROR: '처리 중 오류가 발생했습니다.',
} as const;

// 페이징 관련 타입
export type PaginationInput = {
  page: number;
  limit: number;
};

export type Paged<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  lastPage: number;
};

// 정렬 관련 타입
export type SortInput = {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};
