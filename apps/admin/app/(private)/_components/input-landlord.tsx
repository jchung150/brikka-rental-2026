'use client';
import { useUsers } from '@/@hooks/use-users';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useBuildingDetailContext } from '../buildings/[id]/context';
import SelectUser from './select-user';

type Landlord = {
  id: string;
  name: string;
  ownershipPercentage: number;
};

type Props = {
  value?: Landlord[];
  onChange?: (landlords: Landlord[]) => void;
  readonly?: boolean;
};

export default function InputLandlord({
  value = [],
  onChange,
  readonly = false,
}: Props) {
  const { setDialog } = useBuildingDetailContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [ownershipPercentage, setOwnershipPercentage] = useState<string>('');
  const users = useUsers(['LANDLORD']);

  const totalPercentage = useMemo(() => {
    return value.reduce(
      (sum, landlord) => sum + landlord.ownershipPercentage,
      0
    );
  }, [value]);

  const isDisabled = useMemo(() => {
    return readonly || totalPercentage >= 100;
  }, [readonly, totalPercentage]);

  const findName = useCallback(
    (id: string) => {
      return users.find((user) => user.id === id)?.name ?? '';
    },
    [users]
  );

  const handleAddLandlord = () => {
    if (!selectedUserId || !ownershipPercentage) {
      toast.error('임대인와 지분율을 입력해주세요.');
      return;
    }

    const percentage = Number.parseFloat(ownershipPercentage);
    if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast.error('지분율은 0% 이상 100% 이하여야 합니다.');
      return;
    }

    // 중복 체크
    const isDuplicate = value.some(
      (landlord) => landlord.id === selectedUserId
    );
    if (isDuplicate) {
      toast.error('이미 추가된 임대인입니다.');
      return;
    }

    // 총 지분율 체크 (100% 초과 방지)
    const totalPercentage = value.reduce(
      (sum, landlord) => sum + landlord.ownershipPercentage,
      0
    );
    if (totalPercentage + percentage > 100) {
      toast.error('총 지분율은 100% 이하여야 합니다.');
      return;
    }
    const name = findName(selectedUserId);

    const newLandlord: Landlord = {
      id: selectedUserId,
      name: name,
      ownershipPercentage: percentage,
    };

    onChange?.([...value, newLandlord]);
    setSelectedUserId('');
    setOwnershipPercentage('');
    setIsDialogOpen(false);
  };

  const handleRemoveLandlord = (id: string) => {
    onChange?.(value.filter((landlord) => landlord.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-sm">임대인(소유자)</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
            >
              <Plus className="mr-2 h-4 w-4" />
              추가하기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>임대인 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="landlord-select">임대인 선택</Label>
                <div className="flex items-center gap-2">
                  <SelectUser
                    filter={['LANDLORD']}
                    placeholder="임대인를 선택하세요"
                    onValueChange={setSelectedUserId}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setDialog({ type: 'create-landlord' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    신규 임대인 등록
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownership-percentage">소유 지분율 (%)</Label>
                <Input
                  id="ownership-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="지분율을 입력하세요"
                  value={ownershipPercentage}
                  onChange={(e) => setOwnershipPercentage(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleAddLandlord}
                  disabled={!selectedUserId || !ownershipPercentage}
                >
                  추가
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {value.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>임대인</TableHead>
                <TableHead>지분율</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {value.map((landlord) => (
                <TableRow key={landlord.id}>
                  <TableCell>
                    {landlord.name || `사용자 ${landlord.id}`}
                  </TableCell>
                  <TableCell>{landlord.ownershipPercentage}%</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLandlord(landlord.id)}
                      disabled={readonly}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {value.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>등록된 임대인가 없습니다.</p>
          <p className="text-sm">
            위의 "추가하기" 버튼을 클릭하여 임대인를 추가하세요.
          </p>
        </div>
      )}
    </div>
  );
}
