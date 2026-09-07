import type {
  RequestPriority,
  RequestSource,
  RequestStatus,
  RequestType,
} from '@repo/database';
import dayjs from 'dayjs';

export const requestStatusLabels: Record<RequestStatus, string> = {
  PENDING: '미분류',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
  CANCELED: '보류',
  REJECTED: '거부',
} as const;

export const requestTypeLabels: Record<RequestType, string> = {
  COMPLAINT: '민원',
  SUGGESTION: '제안',
  INQUIRY: '문의',
  REPAIR: '수선',
} as const;

export function formatRequestDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function getRequestStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'PENDING':
      return 'text-gray-500';
    case 'IN_PROGRESS':
      return 'text-blue-500';
    case 'COMPLETED':
      return 'text-green-500';
    case 'CANCELED':
      return 'text-yellow-500';
    case 'REJECTED':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export interface RequestListItem {
  id: number;
  buildingName: string;
  requestType: RequestType;
  requestSource: RequestSource;
  unitName: string;
  createdAt: string;
  status: RequestStatus;
  requesterName: string;
  priority: RequestPriority;
}

export interface RequestDetail extends RequestListItem {
  title: string;
  details: string;
  attachments: Attachment[];
  lease?: LeaseInfo;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface LeaseInfo {
  id: number;
  status: string;
  startDate: Date;
  endDate: Date;
  tenantName: string;
}
