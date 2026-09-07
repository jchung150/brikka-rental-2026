'use client';

import { deleteBuildingFacilities } from '@/@actions/buildings/addFacilities';
import { updateFacility } from '@/@actions/facilities';
import type { BuildingDetailDto } from '@/@data/building';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  RiAncientPavilionLine,
  RiBlazeLine,
  RiBuildingLine,
  RiChargingPileLine,
  RiNurseLine,
  RiRecycleLine,
} from '@remixicon/react';
import type { Facility } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Bike,
  BookOpen,
  Building2,
  Cigarette,
  CircleParking,
  Clapperboard,
  Coffee,
  Dumbbell,
  Edit,
  Flower2,
  ForkKnife,
  Gamepad2,
  Ham,
  MoreVertical,
  Music,
  Package,
  PawPrint,
  PersonStanding,
  Printer,
  Sandwich,
  Sofa,
  Trash2,
  Umbrella,
  Users,
  Warehouse,
  WashingMachine,
  Waves,
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import FacilityDialog from '../../../../_components/dialogs/facility-dialog';
import { useBuildingDetailContext } from '../../../context';

interface CommonFacilitiesSectionProps {
  building: BuildingDetailDto;
}

// BuildingFacilityDto 타입 정의
type BuildingFacilityDto = {
  id: bigint;
  buildingId: number;
  facilityId: number;
  description?: string;
  Facility: {
    id: string;
    name: string;
    description?: string;
  };
};

// 수정 폼 스키마
const editFacilitySchema = z.object({
  name: z.string().min(1, '시설명을 입력해주세요'),
  description: z.string().optional(),
});

type EditFacilityFormType = z.infer<typeof editFacilitySchema>;
type FacilityName =
  | '공용라운지'
  | '커뮤니티룸'
  | '공용가든'
  | '바베큐공간'
  | '공용키친'
  | '공용다이닝룸'
  | '커피바'
  | '스낵바'
  | '공용세탁실'
  | '프린터OA실'
  | '공용시네마'
  | '게임룸'
  | '독서실'
  | '음악연습실'
  | '피트니스센터/헬스장'
  | '요가룸/명상룸'
  | '실내체육관'
  | '수영장'
  | '사우나'
  | '자전거보관소'
  | '택배보관소'
  | '지상주차장'
  | '지하주차장'
  | '전기차충전소'
  | '공동창고'
  | '재활용분리공간'
  | '쓰레기분리배출공간'
  | '반려동물공용공간'
  | '관리실'
  | '안뜰/중정'
  | '코워킹스페이스'
  | '공용회의실'
  | '게스트룸'
  | '흡연구역'
  | '루프탑/옥상정원';

// 기본 아이콘 (매핑되지 않은 시설용)
const DefaultIcon = RiBuildingLine;

const facilityIcons: Record<
  FacilityName,
  React.ComponentType<{ className?: string }> | undefined
> = {
  공용라운지: Sofa,
  커뮤니티룸: Users,
  공용가든: Flower2,
  바베큐공간: Ham,
  공용키친: ForkKnife,
  공용다이닝룸: ForkKnife,
  커피바: Coffee,
  스낵바: Sandwich,
  공용세탁실: WashingMachine,
  프린터OA실: Printer,
  공용시네마: Clapperboard,
  게임룸: Gamepad2,
  독서실: BookOpen,
  음악연습실: Music,
  '피트니스센터/헬스장': Dumbbell,
  '요가룸/명상룸': PersonStanding,
  실내체육관: Dumbbell,
  수영장: Waves,
  사우나: RiBlazeLine,
  자전거보관소: Bike,
  택배보관소: Package,
  지상주차장: CircleParking,
  지하주차장: CircleParking,
  전기차충전소: RiChargingPileLine,
  공동창고: Warehouse,
  재활용분리공간: RiRecycleLine,
  쓰레기분리배출공간: Trash2,
  반려동물공용공간: PawPrint,
  관리실: RiNurseLine,
  '안뜰/중정': RiAncientPavilionLine,
  코워킹스페이스: undefined,
  공용회의실: undefined,
  게스트룸: undefined,
  흡연구역: Cigarette,
  '루프탑/옥상정원': Umbrella,
};

export function CommonFacilitiesSection({
  building,
}: CommonFacilitiesSectionProps) {
  const { refetch } = useBuildingDetailContext();
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getFacilityIcon = (facilityName: string) => {
    // 시설명에서 키워드 찾기
    const matchedKey = Object.keys(facilityIcons).find(
      (key) =>
        facilityName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(facilityName.toLowerCase())
    );

    return facilityIcons[matchedKey as FacilityName] || DefaultIcon;
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (facilityId: bigint) => {
    console.log('Delete facility:', facilityId);
    // TODO: 시설 삭제 확인 모달
    const result = await deleteBuildingFacilities(facilityId);
    if (result.ok) {
      toast.success('시설이 삭제되었습니다.');
      refetch();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold text-lg">공용 시설</CardTitle>
        <FacilityDialog
          mode="create"
          buildingId={Number(building.id)}
          onSuccess={() => {}}
        />
      </CardHeader>
      <CardContent>
        {building.Facilities && building.Facilities.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {building.Facilities.map((facility) => {
              const IconComponent = getFacilityIcon(facility.Facility.name);

              return (
                <div key={facility.id.toString()} className="group relative">
                  {/* 메뉴 버튼 */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => handleEdit(facility.Facility)}
                        >
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(facility.id)}
                          className="text-red-600"
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 시설 카드 */}
                  <div className="flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-gray-50">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center">
                      <IconComponent className="h-8 w-8 text-foreground" />
                    </div>
                    <div className="text-center">
                      <div className="mb-1 font-medium text-sm">
                        {facility.Facility.name}
                      </div>
                      {facility.description && (
                        <div className="line-clamp-2 text-gray-500 text-xs">
                          {facility.Facility.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm">등록된 공용 시설이 없습니다.</p>
            <p className="mt-1 text-gray-400 text-xs">
              + 공용 시설 등록 버튼을 클릭하여 시설을 추가해보세요.
            </p>
          </div>
        )}
      </CardContent>

      {/* 수정 다이얼로그 */}
      <EditFacilityDialog
        facility={editingFacility}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </Card>
  );
}

const EditFacilityDialog = ({
  facility,
  open,
  onOpenChange,
}: {
  facility: Facility | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { refetch } = useBuildingDetailContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditFacilityFormType>({
    resolver: zodResolver(editFacilitySchema),
    defaultValues: {
      name: facility?.name || '',
      description: facility?.description || '',
    },
  });

  const { handleSubmit, reset } = form;

  // facility가 변경될 때 폼 값 업데이트
  React.useEffect(() => {
    if (facility) {
      reset({
        name: facility.name,
        description: facility.description || '',
      });
    }
  }, [facility, reset]);

  const onSubmit = async (formData: EditFacilityFormType) => {
    if (!facility) return;

    setIsSubmitting(true);
    try {
      const result = await updateFacility(Number(facility.id), {
        name: formData.name,
        description: formData.description,
      });

      if (result.ok) {
        toast.success('공용시설이 성공적으로 수정되었습니다.');
        onOpenChange(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Facility update failed:', error);
      toast.error('시설 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  if (!facility) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            공용시설 수정
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>시설명</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="시설명을 입력해주세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="설명을 입력해주세요 (선택사항)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '수정 중...' : '수정'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
