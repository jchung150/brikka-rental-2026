'use client';

import { deleteLease } from '@/@actions/lease/deleteLease';
import type { LeaseListItem } from '@/@actions/lease/listLeases';
import { Namespace } from '@/@hooks/query-keys';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Strings } from '@repo/common/strings';
import type { LeaseStatus } from '@repo/database';
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
import { Edit, Eye, FileText, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreateLeaseColumnsProps {
  onStatusChange: (lease: LeaseListItem) => void;
}

export function createLeaseColumns({
  onStatusChange,
}: CreateLeaseColumnsProps): ColumnDef<LeaseListItem>[] {
  const router = useRouter();
  return [
    {
      accessorKey: 'remainingDays',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 만료까지" />
      ),
      cell: ({ row }) => {
        const remainingDays = row.original.remainingDays;
        const isExpired = remainingDays < 0;
        const isUrgent = remainingDays >= 0 && remainingDays <= 3;
        const isUpcoming = remainingDays > 3 && remainingDays <= 30;

        let text = '';
        let className = '';

        if (isExpired) {
          text = '만료됨';
          className = 'text-gray-500';
        } else if (remainingDays === 0) {
          text = '오늘 만료';
          className = 'text-red-600 font-semibold';
        } else if (isUrgent) {
          text = `${remainingDays}일 남음`;
          className = 'text-red-600 font-semibold';
        } else if (isUpcoming) {
          text = `${remainingDays}일 남음`;
          className = 'text-red-600';
        } else {
          text = `${remainingDays}일 남음`;
          className = 'text-blue-600';
        }

        return <div className={className}>{text}</div>;
      },
    },
    {
      accessorKey: 'tenantName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약명" />
      ),
      cell: ({ row }) => {
        const lease = row.original;
        const contractName = `${lease.buildingName} | ${lease.unitNumber} | ${lease.tenantName}`;
        return (
          <div className="max-w-[300px] truncate font-medium">
            {contractName}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 상태" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = getStatusConfig(status);

        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
            <span className="hextwsm">{statusConfig.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 시작일" />
      ),
      cell: ({ row }) => {
        const startDate = new Date(row.original.startDate).toLocaleDateString(
          'ko-KR'
        );
        return <div className="text-sm">{startDate}</div>;
      },
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="계약 종료일" />
      ),
      cell: ({ row }) => {
        const endDate = new Date(row.original.endDate).toLocaleDateString(
          'ko-KR'
        );
        return <div className="text-sm">{endDate}</div>;
      },
    },
    {
      accessorKey: 'rent',
      header: '임대료',
      cell: ({ row }) => {
        // 임대료는 별도 테이블에서 조회해야 하므로 임시로 표시
        return <div className="font-medium">88만원</div>;
      },
    },
    {
      accessorKey: 'renewalNoticeDeadline',
      header: '갱신 통지 마감까지',
      cell: ({ row }) => {
        // 갱신 통지 마감일 계산 (임시로 40일로 설정)
        const renewalDays = 40;
        const isOverdue = renewalDays < 0;
        const isUpcoming = renewalDays > 0 && renewalDays <= 30;

        let text = '';
        let className = '';

        if (isOverdue) {
          text = '마감일 경과';
          className = 'text-red-600';
        } else {
          text = `${renewalDays}일 남음`;
          className = isUpcoming ? 'text-red-600' : 'text-blue-600';
        }

        return <div className={className}>{text}</div>;
      },
    },
    {
      id: 'actions',
      header: '더보기',
      cell: ({ row }) => {
        const lease = row.original;
        const queryClient = useQueryClient();

        const handleDelete = async () => {
          try {
            const result = await deleteLease({ id: lease.id });

            if (result.ok) {
              toast.success('계약이 성공적으로 삭제되었습니다.');
              queryClient.invalidateQueries({
                queryKey: [Namespace.Lease],
                exact: false,
              });
            } else {
              toast.error(result.message || '삭제 중 오류가 발생했습니다.');
            }
          } catch (error) {
            console.error('Delete lease error:', error);
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
              <DropdownMenuLabel>
                {lease.buildingName} | {lease.unitNumber}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/leases/new?renewFrom=${lease.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                재계약 하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/leases/${lease.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                계약 상세보기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(lease)}>
                <Edit className="mr-2 h-4 w-4" />
                계약 상태 변경
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <X className="mr-2 h-4 w-4" />
                계약 해지
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                    계약 삭제
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>계약 삭제 확인</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>
                        "{lease.buildingName} | {lease.unitNumber} |{' '}
                        {lease.tenantName}"
                      </strong>{' '}
                      계약을 정말 삭제하시겠습니까?
                      <br />
                      <br />이 작업은 되돌릴 수 없으며, 계약과 관련된 모든
                      데이터가 삭제됩니다.
                      <br />
                      관련된 청구서, 첨부파일, 알림 설정 등의 데이터가 있는 경우
                      삭제할 수 없습니다.
                      <br />
                      <br />
                      <strong>진행 중인 계약은 삭제할 수 없습니다.</strong>
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
}

function getStatusConfig(status: string) {
  const label = Strings.leaseStatus[status as LeaseStatus];
  switch (status) {
    case 'PREPARING':
      return {
        label,
        color: 'bg-yellow-500',
      };
    case 'ACTIVE':
      return {
        label,
        color: 'bg-blue-500',
      };
    case 'COMPLETED':
      return {
        label,
        color: 'bg-gray-500',
      };
    case 'TERMINATED':
      return {
        label,
        color: 'bg-red-500',
      };
    default:
      return {
        label: '알 수 없음',
        color: 'bg-gray-400',
      };
  }
}
