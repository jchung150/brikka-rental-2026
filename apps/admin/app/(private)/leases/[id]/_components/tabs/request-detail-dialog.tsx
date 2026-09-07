import type { RequestListItem } from '@/@actions/requests/listRequests';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Label } from '@repo/design-system/components/ui/label';
import { Separator } from '@repo/design-system/components/ui/separator';

interface RequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestListItem | null;
}

export function RequestDetailDialog({
  open,
  onOpenChange,
  request,
}: RequestDetailDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELED':
        return 'bg-red-500';
      case 'REJECTED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>요청 상세 정보</DialogTitle>
          <DialogDescription>
            요청 내역의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                요청 ID
              </Label>
              <div className="mt-1 font-medium text-sm">{request.id}</div>
            </div>
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                등록일시
              </Label>
              <div className="mt-1 text-sm">
                {formatters.dateTime(request.createdAt)}
              </div>
            </div>
          </div>

          <div>
            <Label className="font-medium text-gray-500 text-sm">
              요청 제목
            </Label>
            <div className="mt-1 font-medium text-sm">{request.title}</div>
          </div>

          {request.details && (
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                요청 내용
              </Label>
              <div className="mt-1 whitespace-pre-wrap text-sm">
                {request.details}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-gray-500 text-sm">출처</Label>
              <div className="mt-1 text-sm">{request.requestSource}</div>
            </div>
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                요청 유형
              </Label>
              <div className="mt-1 text-sm">
                {Strings.requestType[request.requestType]}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                처리 상태
              </Label>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(request.status)}`}
                />
                <span className="text-sm">
                  {Strings.requestStatus[request.status]}
                </span>
              </div>
            </div>
            <div>
              <Label className="font-medium text-gray-500 text-sm">
                요청자
              </Label>
              <div className="mt-1 text-sm">{request.Requester?.name}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
