'use client';
import { useSearch } from '@/context/search-context';
import { useSidebarData } from '@/hooks/use-sidebar-data';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/components/ui/command';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { IconArrowRightDashed } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function CommandMenu() {
  const { open, setOpen } = useSearch();
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  const sidebarData = useSidebarData();

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="명령어를 입력하세요..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pr-1">
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.href) {
                  return (
                    <CommandItem
                      key={`${navItem.href}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        //@ts-ignore
                        runCommand(() => router.push(navItem.href));
                      }}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <IconArrowRightDashed className="size-2 text-muted-foreground/80" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  );
                }

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${subItem.href}-${i}`}
                    value={subItem.title}
                    onSelect={() => {
                      runCommand(() => router.push(subItem.href));
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      <IconArrowRightDashed className="size-2 text-muted-foreground/80" />
                    </div>
                    {subItem.title}
                  </CommandItem>
                ));
              })}
            </CommandGroup>
          ))}
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
