import { getBuildingDetail } from '@/@actions/buildings/getDetail';
import { notFound } from 'next/navigation';
import { BuildingDetailClient } from './_components/building-detail-client';
import { BuildingDetailDialogs } from './_components/building-detail-dialogs';
import { BuildingDetailProvider } from './context';

interface BuildingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuildingDetailPage({
  params,
}: BuildingDetailPageProps) {
  const { id } = await params;
  const result = await getBuildingDetail(Number(id));

  if (!result.ok) {
    if (result.code === 'NOT_FOUND') {
      notFound();
    }
    // TODO: 에러 처리 UI
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-600">오류 발생</h1>
          <p className="text-gray-600">{result.message}</p>
        </div>
      </div>
    );
  }

  const building = result.data;

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">{building.name}</h1>
          <p className="mt-1 text-gray-600">{building.address}</p>
        </div>
      </div>

      {/* 클라이언트 컴포넌트로 탭 네비게이션과 컨텐츠 관리 */}
      <BuildingDetailProvider id={Number(id)}>
        <BuildingDetailClient />
        <BuildingDetailDialogs />
      </BuildingDetailProvider>
    </div>
  );
}
