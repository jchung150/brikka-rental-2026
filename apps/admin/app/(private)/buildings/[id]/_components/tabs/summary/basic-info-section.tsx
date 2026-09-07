'use client';

import { updateBuilding } from '@/@actions/buildings/updateBuilding';
import type { BuildingDetailDto } from '@/@data/building';
import { buildingDetailToDtoMapper } from '@/@data/mapper';
import { InputThumbnail } from '@/app/(private)/_components/input-thumbnail';
import BuildingDialog from '@/app/(private)/buildings/_components/building-dialog';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Calendar, Car, MapPin, Thermometer, User } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useBuildingDetailContext } from '../../../context';

interface BasicInfoSectionProps {
  building: BuildingDetailDto;
}

export function BasicInfoSection({ building }: BasicInfoSectionProps) {
  const { refetch } = useBuildingDetailContext();

  const buildingDto = useMemo(() => {
    return buildingDetailToDtoMapper(building);
  }, [building]);
  const formatOwnership = () => {
    if (!building.Ownerships || building.Ownerships.length === 0) {
      return '미등록';
    }

    return building.Ownerships.map(
      (ownership) =>
        `${ownership.landlordName} ${ownership.ownershipPercentage}%`
    ).join(' | ');
  };

  const formatAccount = () => {
    if (!building.accountBank || !building.accountNumber) {
      return '미등록';
    }

    const holder = building.accountHolder
      ? ` (예금주: ${building.accountHolder})`
      : '';
    return `${building.accountBank} | ${building.accountNumber}${holder}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '미등록';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold text-lg">기본 정보</CardTitle>
        <BuildingDialog mode="edit" building={buildingDto} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 건물 이미지와 기본 정보 */}
        <div className="flex gap-6">
          <InputThumbnail
            onUpload={async (file) => {
              await updateBuilding(building.id, {
                thumbnailUrl: file.fileUrl,
              });
              toast.success('건물 이미지가 업로드되었습니다.');
              refetch();
            }}
            value={building.thumbnailUrl ?? undefined}
            onRemove={async () => {
              await updateBuilding(building.id, {
                thumbnailUrl: null,
              });
              toast.success('건물 이미지가 삭제되었습니다.');
              refetch();
            }}
          />

          {/* 기본 정보 목록 */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="font-medium text-gray-500 text-sm">
                  건물 이름
                </div>
                <div className="font-semibold text-base">{building.name}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <MapPin className="h-4 w-4" />
                  건물 주소
                </div>
                <div className="text-base">{building.address}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <User className="h-4 w-4" />
                  임대인 이름
                </div>
                <div className="text-base">{formatOwnership()}</div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-500 text-sm">
                  건물 관리자 이름
                </div>
                <div className="text-base">
                  {building.Manager ? building.Manager.name : '미지정'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-500 text-sm">
                  건물 운영 계좌
                </div>
                <div className="text-base">{formatAccount()}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <Car className="h-4 w-4" />
                  주차 가능 여부
                </div>
                <div className="text-base">
                  <Badge
                    variant={
                      building.isParkingAvailable ? 'default' : 'secondary'
                    }
                  >
                    {building.isParkingAvailable ? '가능' : '불가능'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-medium text-gray-500 text-sm">
                  엘리베이터 여부
                </div>
                <div className="text-base">
                  <Badge
                    variant={building.hasElevator ? 'default' : 'secondary'}
                  >
                    {building.hasElevator ? '있음' : '없음'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <Thermometer className="h-4 w-4" />
                  난방 유형
                </div>
                <div className="text-base">
                  {building.heatingType || '미등록'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <Calendar className="h-4 w-4" />
                  건축일
                </div>
                <div className="text-base">
                  {formatDate(building.createdAt)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 font-medium text-gray-500 text-sm">
                  <Calendar className="h-4 w-4" />
                  사용 승인일
                </div>
                <div className="text-base">
                  {formatDate(building.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
