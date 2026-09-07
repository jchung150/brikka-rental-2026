'use client';

import type { LeaseMessage } from '@/@actions/lease/getLeaseMessages';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {} from '@repo/design-system/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';
import {} from 'lucide-react';

interface CreateMessagesColumnsProps {
  onViewDetails: (message: LeaseMessage) => void;
  onResend: (message: LeaseMessage) => void;
}

export function createMessagesColumns({
  onViewDetails,
  onResend,
}: CreateMessagesColumnsProps): ColumnDef<LeaseMessage>[] {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return '이메일';
      case 'SMS':
        return 'SMS';
      case 'ALIMTALK':
        return '알림톡';
      case 'PUSH':
        return '푸시';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '전송성공';
      case 'FAILED':
        return '전송실패';
      case 'PENDING':
        return '전송대기';
      default:
        return '알 수 없음';
    }
  };

  const getSendMethodLabel = (method: string) => {
    switch (method) {
      case 'AUTOMATIC':
        return '자동';
      case 'MANUAL':
        return '수동';
      default:
        return '알 수 없음';
    }
  };

  return [
    {
      accessorKey: 'sentAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="발송일시" />
      ),
      cell: ({ row }) => {
        const sentAt = row.original.sentAt;
        return <div className="text-sm">{formatDateTime(sentAt)}</div>;
      },
    },
    {
      accessorKey: 'channel',
      header: '채널',
      cell: ({ row }) => {
        const channel = row.original.channel;
        return <div className="text-sm">{getChannelLabel(channel)}</div>;
      },
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => {
        const title = row.original.title;
        return <div className="font-medium text-sm">{title}</div>;
      },
    },
    {
      accessorKey: 'recipient',
      header: '수신자',
      cell: ({ row }) => {
        const recipient = row.original.recipient;
        return <div className="text-sm">{recipient}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className={`font-medium text-sm ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </div>
        );
      },
    },
    {
      accessorKey: 'sendMethod',
      header: '발송방식',
      cell: ({ row }) => {
        const method = row.original.sendMethod;
        return <div className="text-sm">{getSendMethodLabel(method)}</div>;
      },
    },
    {
      accessorKey: 'sender',
      header: '발송자',
      cell: ({ row }) => {
        const sender = row.original.sender;
        return <div className="text-sm">{sender}</div>;
      },
    },
    // {
    //   id: 'actions',
    //   header: '더보기',
    //   cell: ({ row }) => {
    //     const message = row.original;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">메뉴 열기</span>
    //             <MoreHorizontal className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuItem onClick={() => onViewDetails(message)}>
    //             <Eye className="mr-2 h-4 w-4" />
    //             상세 보기
    //           </DropdownMenuItem>
    //           {message.status === 'FAILED' && (
    //             <DropdownMenuItem onClick={() => onResend(message)}>
    //               <RefreshCw className="mr-2 h-4 w-4" />
    //               재발송
    //             </DropdownMenuItem>
    //           )}
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];
}
