'use server';

import { auth } from '@/auth';
import { type ChangeTargetType, database } from '@repo/database';

export async function createChangeHistory(
  targetType: ChangeTargetType,
  targetId: bigint,
  changes: Record<string, { before: unknown; after: unknown }>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await database.changeHistory.create({
    data: {
      targetType,
      targetId,
      userId: BigInt(session.user.id),
      changes: JSON.stringify(changes),
    },
  });
}

// 민감 정보 필드 목록
const SENSITIVE_FIELDS = [
  'passwordHash',
  'twoFactorSecret',
  'accessToken',
  'refreshToken',
];

// 민감 정보 필드 제거
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

// 변경된 필드만 필터링
function getChangedFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {};

  // after 객체의 모든 키를 확인
  for (const key in after) {
    if (Object.prototype.hasOwnProperty.call(after, key)) {
      // BigInt는 JSON.stringify로 비교할 수 없으므로 문자열로 변환하여 비교
      const beforeValue =
        typeof before[key] === 'bigint' ? before[key]?.toString() : before[key];
      const afterValue =
        typeof after[key] === 'bigint' ? after[key]?.toString() : after[key];

      // 값이 변경된 경우에만 추가
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changes[key] = {
          before: before[key],
          after: after[key],
        };
      }
    }
  }

  return changes;
}

/**
 * Create 작업 이력 기록
 * @param targetType 대상 유형 (BUILDING, UNIT, LEASE 등)
 * @param targetId 대상 ID
 * @param data 생성된 데이터
 */
export async function trackCreate(
  targetType: ChangeTargetType,
  targetId: bigint,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const sanitizedData = sanitizeData(data);
    const changes: Record<string, { before: unknown; after: unknown }> = {};

    // 모든 필드를 before: null, after: value 형식으로 변환
    for (const key in sanitizedData) {
      if (Object.prototype.hasOwnProperty.call(sanitizedData, key)) {
        changes[key] = {
          before: null,
          after: sanitizedData[key],
        };
      }
    }

    await createChangeHistory(targetType, targetId, changes);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[ChangeHistory] Failed to track create:', error);
    // 이력 기록 실패는 무시하고 계속 진행
  }
}

/**
 * Update 작업 이력 기록 (before/after 비교)
 * @param targetType 대상 유형 (BUILDING, UNIT, LEASE 등)
 * @param targetId 대상 ID
 * @param before 변경 전 데이터
 * @param after 변경 후 데이터
 */
export async function trackUpdate(
  targetType: ChangeTargetType,
  targetId: bigint,
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Promise<void> {
  try {
    const sanitizedBefore = sanitizeData(before);
    const sanitizedAfter = sanitizeData(after);

    // 변경된 필드만 필터링
    const changes = getChangedFields(sanitizedBefore, sanitizedAfter);

    // 변경사항이 있는 경우에만 기록
    if (Object.keys(changes).length > 0) {
      await createChangeHistory(targetType, targetId, changes);
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[ChangeHistory] Failed to track update:', error);
    // 이력 기록 실패는 무시하고 계속 진행
  }
}

/**
 * Delete 작업 이력 기록
 * @param targetType 대상 유형 (BUILDING, UNIT, LEASE 등)
 * @param targetId 대상 ID
 * @param data 삭제된 데이터
 */
export async function trackDelete(
  targetType: ChangeTargetType,
  targetId: bigint,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const sanitizedData = sanitizeData(data);
    const changes: Record<string, { before: unknown; after: unknown }> = {};

    // 모든 필드를 before: value, after: null 형식으로 변환
    for (const key in sanitizedData) {
      if (Object.prototype.hasOwnProperty.call(sanitizedData, key)) {
        changes[key] = {
          before: sanitizedData[key],
          after: null,
        };
      }
    }

    await createChangeHistory(targetType, targetId, changes);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Server-side logging
    console.error('[ChangeHistory] Failed to track delete:', error);
    // 이력 기록 실패는 무시하고 계속 진행
  }
}
