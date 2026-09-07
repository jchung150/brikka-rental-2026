'use client';

import type { LandlordDetail } from '@/@actions/landlords/getLandlordDetail';
import { DataTable } from '@/components/data-table/data-table';
import { formatters } from '@repo/common/formatters';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface DocumentsTabProps {
  landlord: LandlordDetail;
}

type Document = {
  id: string;
  title: string;
  createdAt: Date;
  uploadedBy: string;
};

function DocumentsToolbar() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-lg">문서보관</h2>
      {/* <div className="flex space-x-2">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          파일 업로드
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
      </div> */}
    </div>
  );
}

export function DocumentsTab({ landlord }: DocumentsTabProps) {
  // 임대인 관련 문서는 현재 스키마에 없으므로 빈 배열로 처리
  // 추후 임대인 전용 문서 테이블이 추가되면 해당 데이터를 조회하도록 수정
  const documents = useMemo(() => {
    return [] as Document[];
  }, []);

  const columns: ColumnDef<Document>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: '제목',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('title')}</div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '등록일시',
        cell: ({ row }) => (
          <div>{formatters.dateTime(row.getValue('createdAt'))}</div>
        ),
      },
      {
        accessorKey: 'uploadedBy',
        header: '관리자',
        cell: ({ row }) => <div>{row.getValue('uploadedBy')}</div>,
      },
      {
        id: 'actions',
        header: '더보기',
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">메뉴 열기</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>액션</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  보기
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  다운로드
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={documents}
        Toolbar={DocumentsToolbar}
        pageSize={10}
      />
    </div>
  );
}
