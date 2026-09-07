import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { formatters } from '@repo/common/formatters';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('ko');

interface SummarySectionProps {
  lease: LeaseDetail;
}

function getLeaseAmount(lease: LeaseDetail, itemName: string) {
  const schedule = lease.BillingSchedules?.find(
    (schedule) => schedule.itemName === itemName
  );
  return schedule?.amount || 0;
}

export function SummarySection({ lease }: SummarySectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="space-y-2">
            <div className="font-medium text-gray-500 text-sm">잔액</div>
            <div className="font-bold text-2xl text-gray-900">
              {formatters.currency(13000000)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <div className="font-medium text-gray-500 text-sm">
              임대료(약정액)
            </div>
            <div className="font-bold text-2xl text-gray-900">
              {formatters.currency(getLeaseAmount(lease, '임대료'))}
            </div>
            <div className="text-gray-500 text-xs">매월 25일 납부</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <div className="font-medium text-gray-500 text-sm">
              보증금(약정액)
            </div>
            <div className="font-bold text-2xl text-gray-900">
              {formatters.currency(getLeaseAmount(lease, '보증금'))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <div className="font-medium text-gray-500 text-sm">계약 만료일</div>
            <div className="font-bold text-2xl text-gray-900">
              {formatters.date(lease.endDate)}
            </div>
            <div className="text-gray-500 text-xs">
              {formatters.remainingDays(lease.endDate)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
