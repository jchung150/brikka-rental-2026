import { listLandlords } from '@/@actions/landlords/listLandlords';
import { LandlordTable } from './components/landlord-table';

export default async function LandlordsPage() {
  // 임대인 목록 조회
  const result = await listLandlords();

  if (!result.ok) {
    return (
      <div>임대인 목록을 불러오는 중 오류가 발생했습니다: {result.message}</div>
    );
  }

  return <LandlordTable landlords={result.data} />;
}
