import { C } from '@repo/common/constant';
import type {
  Attachment,
  Building,
  File,
  User,
} from '@repo/database/generated/client';

export type DocumentWithDetails = Attachment & {
  File: Pick<File, 'fileName' | 'createdAt'>;
  Uploader: Pick<User, 'name'>;
  Building: Pick<Building, 'name'>;
};

export type DocumentFormData = {
  category: string;
  type: string;
  memo?: string;
  fileId: number;
  uploaderId: number;
};

export const documentCategoryLabels = {
  건물공용: '건물 공용',
  유닛: '유닛',
} as const;

export const documentTypeLabels = {
  건물공용: C.DOC_TYPE_BUILDING,
  유닛: C.DOC_TYPE_UNIT,
} as const;

export function formatDocumentDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;

  return `${year}/${month}/${day} ${displayHours}:${minutes}${ampm}`;
}

export function getDocumentClassificationVariant(classification: string) {
  switch (classification) {
    case '건물 공용':
      return 'default';
    case '유닛':
      return 'secondary';
    default:
      return 'outline';
  }
}
