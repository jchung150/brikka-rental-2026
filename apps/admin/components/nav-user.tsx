import {
  Avatar,
  AvatarFallback,
} from '@repo/design-system/components/ui/avatar';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/design-system/components/ui/sidebar';
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const getRoleInfo = (role?: string) => {
  switch (role) {
    case 'ADMIN':
      return { label: '슈퍼관리자', variant: 'default' as const };
    case 'FACILITY_MANAGER':
      return { label: '시설관리자', variant: 'secondary' as const };
    case 'GENERAL_MANAGER':
      return { label: '일반관리자', variant: 'secondary' as const };
    case 'LANDLORD':
      return { label: '임대인', variant: 'outline' as const };
    case 'TENANT':
      return { label: '입주자', variant: 'outline' as const };
    default:
      return { label: '사용자', variant: 'outline' as const };
  }
};

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const roleInfo = getRoleInfo(role);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs">{user.email}</span>
                  <Badge
                    variant={roleInfo.variant}
                    className="px-1.5 py-0.5 text-xs"
                  >
                    {roleInfo.label}
                  </Badge>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs">{user.email}</span>
                    <Badge
                      variant={roleInfo.variant}
                      className="px-1.5 py-0.5 text-xs"
                    >
                      {roleInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                계정 정보
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Bell />
                알림 설정
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                signOut();
              }}
            >
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
