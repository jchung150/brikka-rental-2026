'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import type {
  RequestPriority,
  RequestSource,
  RequestStatus,
  RequestType,
} from '@repo/database';

// 요청 유형 한글 변환
const getRequestTypeLabel = (type: RequestType): string => {
  switch (type) {
    case 'COMPLAINT':
      return '민원';
    case 'SUGGESTION':
      return '제안';
    case 'INQUIRY':
      return '문의';
    case 'REPAIR':
      return '수선';
    default:
      return type;
  }
};

// 요청 출처 한글 변환
const getRequestSourceLabel = (source: RequestSource | null): string => {
  switch (source) {
    case 'TENANT_REQUEST':
      return '입주자 요청';
    case 'TENANT_FACE_TO_FACE':
      return '입주자 대면접수';
    case 'LANDLORD_REQUEST':
      return '건물주 요청';
    case 'LANDLORD_FACE_TO_FACE':
      return '건물주 대면접수';
    case 'INTERNAL':
      return '내부 등록';
    default:
      return source || '미지정';
  }
};

// 처리 상태 한글 변환
const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'PENDING':
      return '미분류';
    case 'IN_PROGRESS':
      return '처리중';
    case 'COMPLETED':
      return '완료';
    case 'CANCELED':
      return '보류';
    case 'REJECTED':
      return '거부';
    default:
      return status;
  }
};

// 우선순위 한글 변환
const getPriorityLabel = (priority: RequestPriority | null): string => {
  switch (priority) {
    case 'LOW':
      return '낮음';
    case 'MEDIUM':
      return '보통';
    case 'HIGH':
      return '높음';
    default:
      return '미지정';
  }
};

// 경과 일수 계산
const getElapsedDays = (createdAt: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 날짜 포맷팅
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export const requestColumns: ColumnDef<RequestListItem>[] = [
  {
    accessorKey: 'Building.name',
    header: '건물 고유 이름',
    cell: ({ row }) => {
      const buildingName = row.original.Building?.name;
      return <span>{buildingName || '-'}</span>;
    },
  },
  {
    accessorKey: 'requestType',
    header: '요청 유형',
    cell: ({ row }) => {
      const type = row.original.requestType;
      return <span>{getRequestTypeLabel(type)}</span>;
    },
  },
  {
    accessorKey: 'requestSource',
    header: '출처',
    cell: ({ row }) => {
      const source = row.original.requestSource;
      return <span>{getRequestSourceLabel(source)}</span>;
    },
  },
  {
    accessorKey: 'Unit.name',
    header: '유닛 고유 이름',
    cell: ({ row }) => {
      const unitName = row.original.Unit?.name;
      return <span>{unitName || '-'}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: '등록일시',
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    id: 'elapsedDays',
    header: '경과 일수',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      const days = getElapsedDays(createdAt);
      const isOverdue = days >= 3;

      return (
        <span className={isOverdue ? 'font-medium text-red-600' : ''}>
          {days}일 지남
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '처리 상태',
    cell: ({ row }) => {
      const status = row.original.status;
      return <span>{getStatusLabel(status)}</span>;
    },
  },
  {
    accessorKey: 'Requester.name',
    header: '담당자',
    cell: ({ row }) => {
      const requesterName = row.original.Requester?.name;
      return <span>{requesterName || '-'}</span>;
    },
  },
  {
    accessorKey: 'priority',
    header: '우선순위',
    cell: ({ row }) => {
      const priority = row.original.priority;
      return <span>{getPriorityLabel(priority)}</span>;
    },
  },
  {
    id: 'actions',
    header: '더보기',
    cell: ({ row }) => {
      const requestId = row.original.id.toString();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/requests/${requestId}`}>상세보기</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
