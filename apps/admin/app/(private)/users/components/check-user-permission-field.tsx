import { UserPermissionType } from '@repo/database/generated/client';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {} from '@repo/design-system/components/ui/form';
import { Label } from '@repo/design-system/components/ui/label';
import {} from '@repo/design-system/components/ui/tooltip';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

// 권한별 설명 정의
const PERMISSION_DESCRIPTIONS: Record<
  UserPermissionType,
  { label: string; description: string }
> = {
  MANAGER_GENERAL: {
    label: '일반 관리권한',
    description: '기본적인 관리 기능에 접근할 수 있습니다.',
  },
  MANAGER_FACILITY: {
    label: '시설 관리권한',
    description: '건물 시설 및 공용 공간을 관리할 수 있습니다.',
  },
  USER_MANAGEMENT: {
    label: '사용자 관리권한',
    description: '사용자 등록, 수정, 삭제를 관리할 수 있습니다.',
  },
  BUILDING_MANAGEMENT: {
    label: '건물 관리권한',
    description: '건물 정보 및 유닛을 관리할 수 있습니다.',
  },
  LEASE_MANAGEMENT: {
    label: '임대차 관리권한',
    description: '임대차 계약을 관리할 수 있습니다.',
  },
  BILLING_MANAGEMENT: {
    label: '청구 관리권한',
    description: '청구서 발행 및 수납을 관리할 수 있습니다.',
  },
  REPORT_VIEW: {
    label: '리포트 조회권한',
    description: '다양한 리포트를 조회할 수 있습니다.',
  },
  SYSTEM_SETTINGS: {
    label: '시스템 설정권한',
    description: '시스템 설정을 변경할 수 있습니다.',
  },
};

// 권한 타입별 표시할 권한들
const PERMISSIONS_BY_ROLE: Record<string, UserPermissionType[]> = {
  MANAGER: [
    UserPermissionType.MANAGER_GENERAL,
    UserPermissionType.MANAGER_FACILITY,
  ],
  ADMIN: [],
  TENANT: [],
  LANDLORD: [],
};

export const CheckUserPermissionField = () => {
  const form = useFormContext();
  const [selectedPermissions, setSelectedPermissions] = useState<
    UserPermissionType[]
  >([]);

  // 폼에서 현재 선택된 userRole을 가져옴
  const currentUserRole = form.watch('userRole');
  const roleType = currentUserRole as
    | 'ADMIN'
    | 'MANAGER'
    | 'TENANT'
    | 'LANDLORD';

  const availablePermissions = PERMISSIONS_BY_ROLE[roleType] || [];

  // 폼에서 현재 선택된 권한들을 가져옴
  useEffect(() => {
    const currentPermissions = form.getValues('permissions') || [];
    setSelectedPermissions(currentPermissions);
  }, [form]);

  // 권한이 없는 역할의 경우 null 반환
  if (availablePermissions.length === 0) {
    return null;
  }

  const handlePermissionChange = (
    permission: UserPermissionType,
    checked: boolean
  ) => {
    const newPermissions = checked
      ? [...selectedPermissions, permission]
      : selectedPermissions.filter((p) => p !== permission);

    setSelectedPermissions(newPermissions);
    form.setValue('permissions', newPermissions);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-md">매니저 권한</h3>

      <div className="flex flex-col gap-2">
        {availablePermissions.map((permission) => {
          const permissionInfo = PERMISSION_DESCRIPTIONS[permission];
          const isChecked = selectedPermissions.includes(permission);

          return (
            <div key={permission} className="flex items-center space-x-3">
              <Label className="flex w-full items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handlePermissionChange(permission, checked as boolean)
                  }
                />
                <div className="grid gap-1.5 font-normal">
                  <p className="font-medium text-sm leading-none">
                    {permissionInfo.label}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {permissionInfo.description}
                  </p>
                </div>
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
