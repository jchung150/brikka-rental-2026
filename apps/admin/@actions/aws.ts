'use server';

import { auth } from '@/auth';
import { env } from '@/env';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Result } from '@repo/common/types';
import { database } from '@repo/database';
import { requireRole } from './lib/auth';
const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

// 실행 파일 확장자 차단 목록
const BlockedExtensions = [
  '.bat',
  '.cmd',
  '.com',
  '.exe',
  '.msi',
  '.msix',
  '.msm',
  '.msp',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.app',
  '.deb',
  '.rpm',
  '.dmg',
  '.pkg',
  '.run',
  '.sh',
  '.ps1',
  '.psm1',
  '.psd1',
  '.ps1xml',
  '.psc1',
  '.psc2',
  '.pssc',
  '.reg',
  '.inf',
  '.sys',
  '.dll',
  '.so',
  '.dylib',
  '.bin',
  '.elf',
  '.out',
  '.appimage',
];

const MaxFileSize = 1024 * 1024 * 10; // 10 MB

export async function getSignedURL(
  key: string,
  type: string,
  fileSize: number,
  checksum: string,
  isPrivate = false
) {
  const session = await auth();

  if (!session) {
    return { failure: 'Not authenticated' };
  }

  const userId = '';

  // 실행 파일 확장자 차단 검사
  const fileExtension = key.toLowerCase().substring(key.lastIndexOf('.'));
  if (BlockedExtensions.includes(fileExtension)) {
    return { failure: `실행 파일은 업로드할 수 없습니다. (${fileExtension})` };
  }

  if (fileSize > MaxFileSize) {
    return { failure: 'File too large' };
  }

  const putCommand = new PutObjectCommand({
    Bucket: isPrivate
      ? (env.AWS_BUCKET_PRIVATE ?? '')
      : (env.NEXT_PUBLIC_AWS_BUCKET ?? ''),
    Key: key,
    ContentType: type,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    Metadata: {
      userId,
    },
  });

  const signedUrl = await getSignedUrl(s3, putCommand, { expiresIn: 60 });

  return {
    success: {
      url: signedUrl,
    },
  };
}

export async function resolveFileURL(
  id: number
): Promise<Result<{ url: string }>> {
  const file = await database.file.findUnique({
    where: { id },
  });

  if (!file) {
    return {
      ok: false,
      code: 'NOT_FOUND',
      message: 'File not found',
    };
  }
  if (!file.isPrivate) {
    return {
      ok: true,
      data: { url: file.fileUrl },
    };
  }

  if (!requireRole('ADMIN')) {
    return {
      ok: false,
      code: 'NOT_AUTHORIZED',
      message: 'Not authorized',
    };
  }

  const getCommand = new GetObjectCommand({
    Bucket: env.AWS_BUCKET_PRIVATE ?? '',
    Key: file.filePath,
  });

  const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 60 });

  return {
    ok: true,
    data: {
      url: signedUrl,
    },
  };
}
