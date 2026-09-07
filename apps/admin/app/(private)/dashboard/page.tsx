import { getDashboardData } from '@/@actions/dashboard/getDashboardData';
import { formatters } from '@repo/common/formatters';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Hourglass, MessageCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

// 요청 출처 매핑
const REQUEST_SOURCE_MAP: Record<string, string> = {
  TENANT_REQUEST: '입주자 요청',
  IN_PERSON: '입주자 대면접수',
  PHONE: '전화 접수',
  EMAIL: '이메일 접수',
  OTHER: '기타',
};

// 요청 타입 매핑
const REQUEST_TYPE_MAP: Record<string, string> = {
  MAINTENANCE: '유지보수',
  COMPLAINT: '불만사항',
  INQUIRY: '문의',
  OTHER: '기타',
};

// 계약명 생성 헬퍼
function getContractName(
  buildingName: string | undefined,
  unitNumber: string | undefined,
  tenantName: string | undefined
): string {
  if (!buildingName || !unitNumber || !tenantName) {
    return '-';
  }
  return formatters.leaseUniqueName(buildingName, unitNumber, tenantName);
}

// 상대 시간 포맷
function getRelativeTime(date: Date): string {
  return dayjs(date).fromNow();
}

// 미납금 계산
function getUnpaidAmount(
  totalAmount: number,
  payments: { amountPaid: number }[]
): number {
  const paidAmount = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  return totalAmount - paidAmount;
}

export default async function Dashboard() {
  const result = await getDashboardData();

  if (!result.ok) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  const { requests, unpaidBills, unpaidBillsCount, expiringLeases } =
    result.data;

  return (
    <>
      {/* 요청목록 & 미납금 현황 & 만료 예정 계약 카드 */}
      <div className="mb-6 grid grid-cols-5 gap-6">
        {/* 요청목록 카드 */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              요청 목록
            </CardTitle>
            <Link href="/requests">
              <Button variant="ghost" size="sm">
                전체보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>출처</TableHead>
                  <TableHead>계약명</TableHead>
                  <TableHead>등록일시</TableHead>
                  <TableHead>구분</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      요청이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const buildingName = request.Unit?.Building?.name;
                    const unitNumber = request.Unit?.unitNumber;
                    const tenantName =
                      request.Lease?.LeaseTenants?.[0]?.Tenant?.name;
                    const contractName = getContractName(
                      buildingName,
                      unitNumber,
                      tenantName
                    );

                    return (
                      <TableRow key={request.id.toString()}>
                        <TableCell className="font-medium">
                          {request.title || '-'}
                        </TableCell>
                        <TableCell>
                          {request.requestSource
                            ? REQUEST_SOURCE_MAP[request.requestSource] ||
                              request.requestSource
                            : '-'}
                        </TableCell>
                        <TableCell>{contractName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-muted-foreground text-xs">
                              {getRelativeTime(request.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {request.requestType
                              ? REQUEST_TYPE_MAP[request.requestType] ||
                                request.requestType
                              : '전체'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 미납금 현황 카드 */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              미납금 현황
              <Badge variant="secondary" className="text-xs">
                총 {unpaidBillsCount}건
              </Badge>
            </CardTitle>
            <Link href="/billing/unpaid">
              <Button variant="ghost" size="sm">
                전체보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>계약명</TableHead>
                  <TableHead>미납금</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidBills.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-8 text-center text-muted-foreground"
                    >
                      미납금이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  unpaidBills.map((bill) => {
                    const buildingName = bill.Lease?.Unit?.Building?.name;
                    const unitNumber = bill.Lease?.Unit?.unitNumber;
                    const tenantName =
                      bill.Lease?.LeaseTenants?.[0]?.Tenant?.name;
                    const contractName = getContractName(
                      buildingName,
                      unitNumber,
                      tenantName
                    );
                    const unpaidAmount = getUnpaidAmount(
                      bill.totalAmount,
                      bill.Payments
                    );

                    return (
                      <TableRow key={bill.id.toString()}>
                        <TableCell className="font-medium">
                          {contractName}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatters.currency(unpaidAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 만료 예정 계약 카드 */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Hourglass className="h-5 w-5 text-pink-600" />
              만료 예정 계약
            </CardTitle>
            <Link href="/leases/expiring">
              <Button variant="ghost" size="sm">
                전체보기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>계약명</TableHead>
                  <TableHead>계약 기간</TableHead>
                  <TableHead>남은일수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringLeases.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      만료 예정 계약이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  expiringLeases.map((lease) => {
                    const buildingName = lease.Unit?.Building?.name;
                    const unitNumber = lease.Unit?.unitNumber;
                    const tenantName = lease.LeaseTenants?.[0]?.Tenant?.name;
                    const contractName = getContractName(
                      buildingName,
                      unitNumber,
                      tenantName
                    );
                    const contractPeriod = `${formatters.dateTime(lease.startDate).split(' ')[0]} - ${formatters.dateTime(lease.endDate).split(' ')[0]}`;

                    return (
                      <TableRow key={lease.id.toString()}>
                        <TableCell className="font-medium">
                          {contractName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {contractPeriod}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatters.remainingDays(lease.endDate)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
