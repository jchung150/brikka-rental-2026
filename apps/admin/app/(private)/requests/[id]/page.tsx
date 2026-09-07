import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getRequestDetail } from '@/@actions/requests/getRequestDetail';
import { NewMemoSection } from './_components/new-memo-section';
import { RequestStatusSection } from './_components/request-status-section';
import { ResponseHistorySection } from './_components/response-history-section';

interface RequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function RequestDetailContent({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const requestId = Number(id);

  if (isNaN(requestId)) {
    notFound();
  }

  const result = await getRequestDetail(requestId);

  if (!result.ok) {
    if (result.code === 'NOT_FOUND') {
      notFound();
    }

    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-600">{result.message}</p>
      </div>
    );
  }

  const request = result.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">요청 상세</h1>
        <p className="text-muted-foreground">
          요청 정보를 확인하고 응답을 관리하세요.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 요청 상태 섹션 */}
        <RequestStatusSection request={request} />

        {/* 응답 내역 섹션 */}
        <ResponseHistorySection requestId={requestId} />

        {/* 신규 메모 작성 섹션 */}
        <NewMemoSection requestId={requestId} />
      </div>
    </div>
  );
}

export default function RequestDetailPage(props: RequestDetailPageProps) {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <RequestDetailContent {...props} />
    </Suspense>
  );
}
