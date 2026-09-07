'use client';
import { useUsers } from '@/@hooks/use-users';
import type { UserRole } from '@repo/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

type Props = {
  defaultValue?: string;
  filter: UserRole[];
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

export default function SelectUser({
  filter = [],
  defaultValue,
  onValueChange,
  placeholder = '사용자를 선택해 주세요',
}: Props) {
  const users = useUsers(filter);

  return (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
