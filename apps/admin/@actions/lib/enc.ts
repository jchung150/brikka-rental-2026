'server-only';

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scrypt,
} from 'node:crypto';
import { promisify } from 'node:util';
import { env } from '@/env';

const scryptAsync = promisify(scrypt);

// 환경 변수에서 암호화 키 가져오기
const ENCRYPTION_KEY = env.ENCRYPTION_KEY;
const SALT_ROUNDS = 12;

// ============================================================================
// 단방향 암호화 (비밀번호 해싱)
// ============================================================================

/**
 * 비밀번호를 해시화합니다 (단방향 암호화)
 * @param password 원본 비밀번호
 * @returns 해시된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // 솔트 생성
    const salt = randomBytes(16).toString('hex');

    // 비밀번호와 솔트를 결합하여 해시 생성
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;

    // 솔트와 해시를 결합하여 반환
    return `${salt}:${hash.toString('hex')}`;
  } catch (error) {
    console.error('[hashPassword] error:', error);
    throw new Error('비밀번호 해시화 중 오류가 발생했습니다.');
  }
}

/**
 * 비밀번호를 검증합니다
 * @param password 원본 비밀번호
 * @param hashedPassword 해시된 비밀번호
 * @returns 비밀번호 일치 여부
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // 해시에서 솔트와 해시 분리
    const [salt, hash] = hashedPassword.split(':');

    if (!salt || !hash) {
      return false;
    }

    // 입력된 비밀번호로 해시 생성
    const testHash = (await scryptAsync(password, salt, 64)) as Buffer;

    // 해시 비교 (타이밍 공격 방지를 위해 Buffer.compare 사용)
    return Buffer.compare(testHash, Buffer.from(hash, 'hex')) === 0;
  } catch (error) {
    console.error('[verifyPassword] error:', error);
    return false;
  }
}

/**
 * 임시 비밀번호를 생성합니다
 * @returns 8~12자리 랜덤 영문+숫자 조합 (최소 1개 이상의 대문자, 소문자, 숫자 포함)
 */
export function generateTemporaryPassword(): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const allChars = uppercaseChars + lowercaseChars + numberChars;

  // 8~12자리 랜덤 길이 결정
  const length = 8 + Math.floor(Math.random() * 5);

  let password = '';

  // 최소 1개 이상의 대문자, 소문자, 숫자 포함 보장
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];

  // 나머지 문자 랜덤 생성
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 문자 순서 섞기 (Fisher-Yates 알고리즘)
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

/**
 * 간단한 해시 생성 (파일명, 토큰 등에 사용)
 * @param data 해시할 데이터
 * @returns SHA-256 해시
 */
export function createSimpleHash(data: string): string {
  return createHmac('sha256', 'default-salt').update(data).digest('hex');
}

// ============================================================================
// 양방향 암호화 (개인정보 암호화)
// ============================================================================

/**
 * 데이터를 암호화합니다 (양방향 암호화)
 * @param text 암호화할 텍스트
 * @returns 암호화된 데이터 (base64 인코딩)
 */
export function encrypt(text: string): string {
  try {
    // 암호화 키를 32바이트로 변환
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

    // IV(Initialization Vector) 생성
    const iv = randomBytes(16);

    // AES-256-CBC 암호화
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV와 암호화된 데이터를 결합하여 base64로 인코딩
    const combined = `${iv.toString('hex')}:${encrypted}`;
    return Buffer.from(combined).toString('base64');
  } catch (error) {
    console.error('[encrypt] error:', error);
    throw new Error('데이터 암호화 중 오류가 발생했습니다.');
  }
}

/**
 * 암호화된 데이터를 복호화합니다
 * @param encryptedData 암호화된 데이터 (base64 인코딩)
 * @returns 복호화된 텍스트
 */
export function decrypt(encryptedData: string): string {
  try {
    // base64 디코딩
    const combined = Buffer.from(encryptedData, 'base64').toString('utf8');

    // IV와 암호화된 데이터 분리
    const [ivHex, encrypted] = combined.split(':');

    if (!ivHex || !encrypted) {
      throw new Error('잘못된 암호화 데이터 형식입니다.');
    }

    // 암호화 키를 32바이트로 변환
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

    // IV 복원
    const iv = Buffer.from(ivHex, 'hex');

    // AES-256-CBC 복호화
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[decrypt] error:', error);
    throw new Error('데이터 복호화 중 오류가 발생했습니다.');
  }
}

// ============================================================================
// 특수 목적 암호화 함수들
// ============================================================================

/**
 * 개인정보 마스킹 (일부만 표시)
 * @param text 마스킹할 텍스트
 * @param visibleStart 앞에서 보여줄 문자 수
 * @param visibleEnd 뒤에서 보여줄 문자 수
 * @param maskChar 마스킹 문자
 * @returns 마스킹된 텍스트
 */
export function maskSensitiveData(
  text: string,
  visibleStart = 2,
  visibleEnd = 2,
  maskChar = '*'
): string {
  if (text.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(text.length);
  }

  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const middle = maskChar.repeat(text.length - visibleStart - visibleEnd);

  return start + middle + end;
}

/**
 * 이메일 마스킹
 * @param email 이메일 주소
 * @returns 마스킹된 이메일
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');

  if (!domain) {
    return maskSensitiveData(email, 1, 1);
  }

  const maskedLocal = maskSensitiveData(localPart, 1, 1);
  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹
 * @param phoneNumber 전화번호
 * @returns 마스킹된 전화번호
 */
export function maskPhoneNumber(phoneNumber: string): string {
  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '');

  if (numbers.length <= 4) {
    return maskSensitiveData(phoneNumber, 1, 1);
  }

  // 앞 3자리, 뒤 4자리만 보여주기
  const masked = maskSensitiveData(numbers, 3, 4);

  // 원본 형식에 맞춰 복원
  let result = masked;
  let originalIndex = 0;

  for (let i = 0; i < phoneNumber.length; i++) {
    if (/\d/.test(phoneNumber[i])) {
      result = result.replace('*', phoneNumber[i]);
      originalIndex++;
    }
  }

  return result;
}

/**
 * 주민등록번호 마스킹
 * @param ssn 주민등록번호
 * @returns 마스킹된 주민등록번호
 */
export function maskSSN(ssn: string): string {
  const numbers = ssn.replace(/\D/g, '');

  if (numbers.length !== 13) {
    return maskSensitiveData(ssn, 2, 2);
  }

  // 앞 6자리, 뒤 1자리만 보여주기
  return maskSensitiveData(numbers, 6, 1);
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 안전한 랜덤 문자열 생성
 * @param length 문자열 길이
 * @returns 랜덤 문자열
 */
export function generateRandomString(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * 안전한 랜덤 토큰 생성 (URL 안전)
 * @param length 토큰 길이
 * @returns 랜덤 토큰
 */
export function generateSecureToken(length = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * 데이터 무결성 검증을 위한 HMAC 생성
 * @param data 검증할 데이터
 * @param secret 비밀키
 * @returns HMAC 해시
 */
export function createHMAC(
  data: string,
  secret: string = ENCRYPTION_KEY
): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * HMAC 검증
 * @param data 원본 데이터
 * @param signature HMAC 서명
 * @param secret 비밀키
 * @returns 검증 결과
 */
export function verifyHMAC(
  data: string,
  signature: string,
  secret: string = ENCRYPTION_KEY
): boolean {
  const expectedSignature = createHMAC(data, secret);
  return expectedSignature === signature;
}

// ============================================================================
// 타입 정의
// ============================================================================

export type EncryptionResult = {
  success: boolean;
  data?: string;
  error?: string;
};

export type HashResult = {
  success: boolean;
  hash?: string;
  error?: string;
};

export type VerificationResult = {
  success: boolean;
  valid?: boolean;
  error?: string;
};

// ============================================================================
// 안전한 래퍼 함수들 (에러 처리 포함)
// ============================================================================

/**
 * 안전한 암호화 (에러 처리 포함)
 * @param text 암호화할 텍스트
 * @returns 암호화 결과
 */
export function safeEncrypt(text: string): EncryptionResult {
  try {
    const encrypted = encrypt(text);
    return { success: true, data: encrypted };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 안전한 복호화 (에러 처리 포함)
 * @param encryptedData 암호화된 데이터
 * @returns 복호화 결과
 */
export function safeDecrypt(encryptedData: string): EncryptionResult {
  try {
    const decrypted = decrypt(encryptedData);
    return { success: true, data: decrypted };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 안전한 비밀번호 해시 (에러 처리 포함)
 * @param password 비밀번호
 * @returns 해시 결과
 */
export async function safeHashPassword(password: string): Promise<HashResult> {
  try {
    const hash = await hashPassword(password);
    return { success: true, hash };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 안전한 비밀번호 검증 (에러 처리 포함)
 * @param password 비밀번호
 * @param hashedPassword 해시된 비밀번호
 * @returns 검증 결과
 */
export async function safeVerifyPassword(
  password: string,
  hashedPassword: string
): Promise<VerificationResult> {
  try {
    const valid = await verifyPassword(password, hashedPassword);
    return { success: true, valid };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
