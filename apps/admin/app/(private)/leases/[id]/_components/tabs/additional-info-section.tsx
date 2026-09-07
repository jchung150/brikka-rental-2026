import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { EditAdditionalInfoDialog } from '../dialog/edit-additional-info-dialog';

interface AdditionalInfoSectionProps {
  lease: LeaseDetail;
}

export function AdditionalInfoSection({ lease }: AdditionalInfoSectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const {
    Vehicles,
    BillingSchedules,
    NotificationSettings,
    Company,
    Broker,
    Foreigner,
    Pet,
  } = lease;

  // 부가 정보가 있는지 확인
  const hasAdditionalInfo =
    Vehicles?.length > 0 ||
    BillingSchedules?.length > 0 ||
    NotificationSettings?.length > 0 ||
    Company ||
    Broker ||
    Foreigner ||
    Pet;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-semibold text-lg">부가 정보</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
        </CardHeader>
        <CardContent>
          {hasAdditionalInfo ? (
            <div className="space-y-6">
              {/* 차량 정보 */}
              {Vehicles && Vehicles.length > 0 && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    차량 정보
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Vehicles.map((vehicle, index) => (
                      <div key={index}>
                        <span className="font-medium text-gray-500 text-sm">
                          차량 {index + 1}
                        </span>
                        <div className="mt-1 text-gray-900 text-sm">
                          {vehicle.licensePlateNumber || '정보 없음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 청구 스케줄 정보 */}
              {BillingSchedules && BillingSchedules.length > 0 && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    청구 스케줄
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {BillingSchedules.map((schedule, index) => (
                      <div key={index}>
                        <span className="font-medium text-gray-500 text-sm">
                          {schedule.itemName}
                        </span>
                        <div className="mt-1 text-gray-900 text-sm">
                          {schedule.amount?.toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 알림 설정 */}
              {NotificationSettings && NotificationSettings.length > 0 && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    알림 설정
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {NotificationSettings.map((setting, index) => (
                      <div key={index}>
                        <span className="font-medium text-gray-500 text-sm">
                          알림 {index + 1}
                        </span>
                        <div className="mt-1 text-gray-900 text-sm">
                          {setting.preferredChannel || '정보 없음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 법인 정보 */}
              {Company && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    법인 정보
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        법인명
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Company.companyName || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        사업자 번호
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Company.businessNumber || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        대표 이름
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Company.representativeName || '정보 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 중개인 정보 */}
              {Broker && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    중개인 정보
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        중개인명
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Broker.representativeName || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        연락처
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Broker.phone || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        이메일
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Broker.email || '정보 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 외국인 정보 */}
              {Foreigner && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    외국인 정보
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        외국인등록번호
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Foreigner.registrationNumber || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        이름
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Foreigner.name || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        연락처
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Foreigner.phone || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        이메일
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Foreigner.email || '정보 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 반려동물 정보 */}
              {Pet && (
                <div>
                  <h3 className="mb-4 font-medium text-gray-900 text-sm">
                    반려동물 정보
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        이름
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Pet.name || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        종류
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Pet.type || '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        체중
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Pet.weight ? `${Pet.weight}kg` : '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        나이
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Pet.age ? `${Pet.age}세` : '정보 없음'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 text-sm">
                        등록 번호
                      </span>
                      <div className="mt-1 text-gray-900 text-sm">
                        {Pet.registrationNumber || '정보 없음'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 text-gray-400 text-lg">📋</div>
                <p className="text-gray-500 text-sm">부가정보가 없습니다</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditAdditionalInfoDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lease={lease}
      />
    </>
  );
}
