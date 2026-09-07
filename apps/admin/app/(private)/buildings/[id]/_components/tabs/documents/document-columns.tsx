'use client';

import { resolveFileURL } from '@/@actions/aws';
import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import {
  formatDocumentDate,
  getDocumentClassificationVariant,
} from '@/@data/document';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

export const createDocumentColumns = (
  onEditDocument?: (document: DocumentListItem) => void,
  onDeleteDocument?: (document: DocumentListItem) => void
): ColumnDef<DocumentListItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모든 행 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'category',
    header: '구분',
    cell: ({ row }) => {
      const classification = row.getValue('category') as string;
      return (
        <Badge variant={getDocumentClassificationVariant(classification)}>
          {classification}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'unitName',
    header: '유닛 이름',
    cell: ({ row }) => {
      const unitName = row.getValue('unitName') as string | null;
      return <div className="text-gray-600 text-sm">{unitName || '-'}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: '카테고리',
    cell: ({ row }) => {
      const category = row.getValue('type') as string;
      return <div className="text-sm">{category}</div>;
    },
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      return (
        <div className="max-w-xs truncate font-medium text-sm" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: 'uploaderName',
    header: '업로드한 사람',
    cell: ({ row }) => {
      const uploaderName = row.getValue('uploaderName') as string;
      return <div className="text-gray-600 text-sm">{uploaderName}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 lg:px-3"
        >
          등록 일시
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      return <div className="text-sm">{formatDocumentDate(createdAt)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const document = row.original;

      const handleDownload = async () => {
        const url = await resolveFileURL(Number(document.fileId));
        if (url.ok) {
          window.open(url.data.url, '_blank');
        }
      };
      const handleEdit = () => {
        onEditDocument?.(document);
      };
      const handleDelete = () => {
        onDeleteDocument?.(document);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              다운로드
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>수정</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
