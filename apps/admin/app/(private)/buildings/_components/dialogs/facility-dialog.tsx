'use client';
import { addBuildingFacilities } from '@/@actions/buildings/addFacilities';
import { createFacility } from '@/@actions/facilities';
import { useFacilities } from '@/@hooks/use-facilities';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useBuildingDetailContext } from '../../[id]/context';

const formSchema = z.object({
  selectedFacilities: z
    .array(z.number())
    .min(1, '최소 하나의 공용시설을 선택해주세요'),
  customFacilities: z.array(z.string()).optional(),
});

type FormType = z.infer<typeof formSchema>;

interface Facility {
  id: string;
  name: string;
  description?: string;
}

interface FacilityDialogProps {
  mode: 'create' | 'edit';
  buildingId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function FacilityDialog({
  buildingId,
  onSuccess,
  trigger,
}: FacilityDialogProps) {
  const { building, refetch } = useBuildingDetailContext();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const { data: facilities } = useFacilities();
  const title = '공용시설 등록';
  const subtitle = '공용시설 정보를 등록해 주세요';

  // 기존 선택된 시설들
  const existingFacilityNames = useMemo(() => {
    return building?.Facilities.map((bf) => Number(bf.Facility.id)) ?? [];
  }, [building]);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedFacilities: existingFacilityNames ?? [],
      customFacilities: [],
    },
  });

  const { handleSubmit, reset, watch, setValue } = form;
  const selectedFacilities = watch('selectedFacilities') || [];

  // 검색 필터링된 시설 목록
  const filteredFacilities = useMemo(() => {
    return facilities?.filter((facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, facilities]);

  const defaultTrigger = (
    <Button variant="outline">
      <Plus className="h-4 w-4" />
      공용시설 등록
    </Button>
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setValue(
        'selectedFacilities',
        facilities?.map((facility) => Number(facility.id)) ?? []
      );
    } else {
      setValue('selectedFacilities', []);
    }
  };

  const handleFacilityToggle = (facilityId: number, checked: boolean) => {
    const current = selectedFacilities || [];
    if (checked) {
      setValue('selectedFacilities', [...current, facilityId]);
    } else {
      setValue(
        'selectedFacilities',
        current.filter((id) => id !== facilityId)
      );
    }
  };

  const onSubmit = async (formData: FormType) => {
    setIsSubmitting(true);

    try {
      const result = await addBuildingFacilities(
        formData.selectedFacilities.map((facility) => ({
          buildingId,
          facilityId: facility,
        }))
      );

      if (result.ok) {
        toast.success('공용시설이 성공적으로 등록되었습니다.');
        setOpen(false);
        reset();
        refetch();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }

      // 임시로 성공 처리
      console.log('Facility data:', { buildingId, ...formData });

      // 성공 시 처리
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Facility operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    reset();
    setSearchTerm('');
    setShowAddNew(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    }
    setOpen(newOpen);
  };

  const isAllSelected = selectedFacilities.length === facilities.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[80vh] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="selectedFacilities"
              render={() => (
                <FormItem>
                  <FormLabel required>공용시설 이름</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {/* 검색 */}
                      <div className="relative">
                        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="공용시설을 검색해 주세요"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* 전체 선택 */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                        />
                        <label
                          htmlFor="select-all"
                          className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          모두 선택
                        </label>
                      </div>

                      {/* 시설 목록 */}
                      <ScrollArea className="h-64 w-full rounded-md border">
                        <div className="space-y-2 p-4">
                          {filteredFacilities.map((facility) => (
                            <div
                              key={facility.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={facility.id.toString()}
                                checked={selectedFacilities.includes(
                                  Number(facility.id)
                                )}
                                onCheckedChange={(checked) =>
                                  handleFacilityToggle(
                                    Number(facility.id),
                                    checked as boolean
                                  )
                                }
                              />
                              <Label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {facility.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddNew((current) => !current)}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        신규 공용시설 추가
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 등록된 공용시설 목록 */}
            {selectedFacilities.length > 0 && (
              <ScrollArea className="h-32 w-full rounded-md ">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">등록된 공용시설</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacilities.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center justify-between rounded-md border px-1"
                      >
                        <span className="text-sm">
                          {facilities.find((f) => Number(f.id) === facility)
                            ?.name ?? ''}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFacilityToggle(facility, false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}

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
                등록
              </Button>
            </div>
          </form>
        </Form>
        <AddNewFacility open={showAddNew} setOpen={setShowAddNew} />
      </DialogContent>
    </Dialog>
  );
}

const addSchema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요'),
  description: z.string().optional(),
});

type AddFormType = z.infer<typeof addSchema>;

const AddNewFacility = ({
  open,
  setOpen,
}: { open: boolean; setOpen: (open: boolean) => void }) => {
  const { building, refetch } = useBuildingDetailContext();
  const form = useForm<AddFormType>({
    resolver: zodResolver(addSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  const { handleSubmit, reset, setValue } = form;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (formData: AddFormType) => {
    setIsSubmitting(true);
    try {
      const result = await createFacility({ ...formData });

      if (result.ok) {
        toast.success('공용시설이 성공적으로 등록되었습니다.');
        setOpen(false);
        reset();
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Facility operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신규 공용시설 추가</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              등록
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
