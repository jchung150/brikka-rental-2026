'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  createMessage?: string;
  className?: string;
  onCreateOption?: (value: string) => void;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = '옵션을 선택하세요...',
  emptyMessage = '검색 결과가 없습니다',
  createMessage = '추가하기',
  className,
  onCreateOption,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  // 검색어에 따른 필터링된 옵션들
  const filteredOptions = React.useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [options, searchValue]
  );

  // 검색어가 기존 옵션에 없는 경우 새로 추가할 수 있는지 확인
  const canCreate =
    searchValue.trim() !== '' &&
    !options.some(
      (option) => option.label.toLowerCase() === searchValue.toLowerCase()
    );

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleSelect = (selectedValue: string) => {
    onValueChange?.(selectedValue === value ? '' : selectedValue);
    setOpen(false);
    setSearchValue('');
  };

  const handleCreate = () => {
    if (canCreate && searchValue.trim()) {
      const newOption = searchValue.trim();
      onCreateOption?.(newOption);
      onValueChange?.(newOption);
      setOpen(false);
      setSearchValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {selectedOption?.label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="검색..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && !canCreate && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}

            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreate}
                  className="cursor-pointer text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createMessage}: "{searchValue}"
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
