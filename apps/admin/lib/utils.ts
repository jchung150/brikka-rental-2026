import { getSignedURL } from '@/@actions/aws';
import { createFile } from '@/@actions/file';
import { env } from '@/env';
import imageCompression from 'browser-image-compression';
import { AwsKeys } from './aws-keys';

export async function computeSHA256(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function uploadFile(
  origin: File,
  key?: string,
  isPrivate?: boolean
): Promise<{
  id: number;
  fileUrl: string;
} | null> {
  // 이미지 파일인지 확인
  const isImageFile = origin.type.startsWith('image/');

  let file: File;

  if (isImageFile) {
    // 이미지 파일인 경우에만 압축 적용
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    file = await imageCompression(origin, options);
  } else {
    // 이미지가 아닌 경우 원본 파일 그대로 사용
    file = origin;
  }

  const Key = key ?? AwsKeys.of(file);
  const checksum = await computeSHA256(file);
  const signedUrlResult = await getSignedURL(
    Key,
    file.type,
    file.size,
    checksum,
    isPrivate
  );

  if (signedUrlResult.failure !== undefined) {
    throw new Error(`Failed to get signed URL: ${signedUrlResult.failure}`);
  }

  const url = signedUrlResult.success.url;

  const resp = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (resp.ok) {
    const fileUrl = `https://s3.ap-northeast-2.amazonaws.com/${env.NEXT_PUBLIC_AWS_BUCKET}/${Key}`;

    const entity = await createFile({
      filePath: Key,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
      fileUrl: fileUrl,
    });

    return {
      id: Number(entity.id),
      fileUrl: entity.fileUrl,
    };
  }

  return null;
}
