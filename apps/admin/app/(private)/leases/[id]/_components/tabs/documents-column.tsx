import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { formatters } from '@repo/common/formatters';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Edit, MoreHorizontal, Trash2 } from 'lucide-react';

export const columns: ColumnDef<DocumentListItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => (
      <div className="font-medium">
        <div className="flex items-center gap-2">
          <span>{row.original.title}</span>
          <span className="text-gray-500 text-xs">
            ({formatters.fileSize(Number(row.original.File.fileSizeBytes))})
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: '카테고리',
    cell: ({ row }) => row.original.category,
  },
  {
    accessorKey: 'Uploader.name',
    header: '관리자명',
    cell: ({ row }) => row.original.Uploader.name,
  },
  {
    accessorKey: 'File.createdAt',
    header: '등록일시',
    accessorFn: (row) => formatters.dateTime(row.File.createdAt),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <Edit className="mr-2 h-4 w-4" />
            수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
];
