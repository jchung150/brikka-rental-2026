'use client';
import { deleteBuilding } from '@/@actions/buildings/deleteBuilding';
import type { BuildingDto } from '@/@data/building';
import { Namespace } from '@/@hooks/query-keys';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBuildingsContext } from '../context';

export const columns: ColumnDef<BuildingDto>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.id}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="건물 이름" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: 'address',
    header: '주소',
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">{row.original.address}</div>
      );
    },
  },
  {
    accessorKey: 'landlordName',
    header: '임대인 이름',
    cell: ({ row }) => {
      const ownerships = row.original.ownerships || [];
      if (ownerships.length === 0) {
        return <div className="text-muted-foreground">-</div>;
      }

      const count = ownerships.length;
      const firstName = ownerships[0]?.landlordName || '';
      return (
        <div className="space-y-1">
          {firstName} {count > 1 ? `외 ${count - 1}명` : ''}
        </div>
      );
    },
  },
  {
    accessorKey: 'managerName',
    header: '건물 관리자 이름',
    cell: ({ row }) => {
      return <div>{row.original.manager?.name || '-'}</div>;
    },
  },
  {
    accessorKey: 'buildingType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="건물 유형" />
    ),
    cell: ({ row }) => {
      const buildingType = row.original.buildingType;
      return buildingType && <Badge variant="secondary">{buildingType}</Badge>;
    },
  },
  {
    id: 'actions',
    header: '더보기',
    cell: ({ row }) => {
      const building = row.original;
      const queryClient = useQueryClient();
      const { setDialog } = useBuildingsContext();

      const handleDelete = async () => {
        try {
          const result = await deleteBuilding({ id: building.id });

          if (result.ok) {
            toast.success('건물이 성공적으로 삭제되었습니다.');
            queryClient.invalidateQueries({
              queryKey: [Namespace.Building],
              exact: false,
            });
          } else {
            toast.error(result.message || '삭제 중 오류가 발생했습니다.');
          }
        } catch (error) {
          console.error('Delete building error:', error);
          toast.error('삭제 중 오류가 발생했습니다.');
        }
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
            <DropdownMenuLabel>{building.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/buildings/${building.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                상세보기
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDialog({ type: 'edit', building })}
            >
              <Edit className="mr-2 h-4 w-4" />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                  삭제
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>건물 삭제 확인</AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>"{building.name}"</strong> 건물을 정말
                    삭제하시겠습니까?
                    <br />
                    <br />이 작업은 되돌릴 수 없으며, 건물과 관련된 모든
                    데이터가 삭제됩니다.
                    <br />
                    관련된 유닛, 임대계약, 요청 등의 데이터가 있는 경우 삭제할
                    수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
