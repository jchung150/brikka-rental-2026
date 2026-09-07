import { getLandlordDetail } from '@/@actions/landlords/getLandlordDetail';
import { notFound } from 'next/navigation';
import { LandlordDetailClient } from './_components/landlord-detail-client';
import { LandlordDetailProvider } from './context';

interface LandlordDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LandlordDetailPage({
  params,
}: LandlordDetailPageProps) {
  const { id } = await params;
  const result = await getLandlordDetail(Number(id));

  if (!result.ok) {
    if (result.code === 'NOT_FOUND') {
      notFound();
    }
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-600">오류 발생</h1>
          <p className="text-gray-600">{result.message}</p>
        </div>
      </div>
    );
  }

  const landlord = result.data;

  return (
    <div className="container mx-auto space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">
            {landlord.BuildingOwnerships.length > 0
              ? `${landlord.BuildingOwnerships[0].Building.name}-${landlord.name}`
              : landlord.name}
          </h1>
          <p className="mt-1 text-gray-600">
            {landlord.BuildingOwnerships.length > 0
              ? landlord.BuildingOwnerships[0].Building.address
              : landlord.email}
          </p>
        </div>
      </div>

      {/* 클라이언트 컴포넌트로 탭 네비게이션과 컨텐츠 관리 */}
      <LandlordDetailProvider landlordId={Number(id)}>
        <LandlordDetailClient landlord={landlord} />
      </LandlordDetailProvider>
    </div>
  );
}
