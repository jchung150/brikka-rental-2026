'use client';

import type { UserRole } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { CreateUserDialog } from './create-user-dialog';

interface UserListToolbarProps {
  table: Table<any>;
  type: UserRole;
}

export function UserListToolbar({ table, type }: UserListToolbarProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    table.getColumn('name')?.setFilterValue(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    table.getColumn('name')?.setFilterValue('');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사용자 이름, 이메일, 전화번호로 검색..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-[300px] pl-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute top-1 right-1 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 역할 필터 */}
        <Select
          value={table.getColumn('userRole')?.getFilterValue() as string}
          onValueChange={(value) => {
            table.getColumn('userRole')?.setFilterValue(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="관리자 역할" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN,MANAGER">전체</SelectItem>
            <SelectItem value="ADMIN">슈퍼 관리자</SelectItem>
            <SelectItem value="MANAGER">관리자</SelectItem>
          </SelectContent>
        </Select>

        {/* 계정 상태 필터 */}
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) =>
            table
              .getColumn('status')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="계정 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="inactive">비활성</SelectItem>
            <SelectItem value="blocked">접근 차단</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CreateUserDialog type={type} />
    </div>
  );
}
