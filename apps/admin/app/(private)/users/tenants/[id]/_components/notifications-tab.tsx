'use client';

import type { TenantDetail } from '@/@actions/tenants/getTenantDetail';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Label } from '@repo/design-system/components/ui/label';
import { useState } from 'react';

interface NotificationsTabProps {
  tenant: TenantDetail;
}

const notificationCategories = [
  {
    id: 'contract',
    label: '계약 및 거주 관련',
    settings: [
      {
        id: 'contract_expiry',
        label: '계약 만료 예정 리마인더',
        description: '계약 만료 30일 전 미리 알림을 받습니다',
        channels: ['notification_talk', 'email'],
      },
    ],
  },
  {
    id: 'billing',
    label: '청구 및 수납 관련',
    settings: [
      {
        id: 'payment_due',
        label: '납부일 알림',
        description: '납부일 3일 전 알림을 받습니다',
        channels: ['notification_talk', 'email', 'sms'],
      },
      {
        id: 'payment_overdue',
        label: '연체 알림',
        description: '납부일 경과 시 알림을 받습니다',
        channels: ['notification_talk', 'email', 'sms'],
      },
    ],
  },
  {
    id: 'maintenance',
    label: '수선 요청/업무 알림',
    settings: [
      {
        id: 'maintenance_update',
        label: '수선 요청 상태 업데이트',
        description: '수선 요청 처리 상태 변경 시 알림을 받습니다',
        channels: ['notification_talk', 'email'],
      },
    ],
  },
  {
    id: 'documents',
    label: '문서 및 알림 관련',
    settings: [
      {
        id: 'document_upload',
        label: '새 문서 업로드 알림',
        description: '관리자가 새 문서를 업로드할 때 알림을 받습니다',
        channels: ['notification_talk', 'email'],
      },
    ],
  },
  {
    id: 'security',
    label: '계정 및 보안',
    settings: [
      {
        id: 'login_alert',
        label: '로그인 알림',
        description: '새로운 기기에서 로그인할 때 알림을 받습니다',
        channels: ['email'],
      },
    ],
  },
];

export function NotificationsTab({ tenant }: NotificationsTabProps) {
  const [activeCategory, setActiveCategory] = useState('contract');
  const [settings, setSettings] = useState<Record<string, string[]>>({
    contract_expiry: ['notification_talk', 'email'],
    payment_due: ['notification_talk', 'email'],
    payment_overdue: ['notification_talk', 'email', 'sms'],
    maintenance_update: ['notification_talk', 'email'],
    document_upload: ['notification_talk', 'email'],
    login_alert: ['email'],
  });

  const handleChannelChange = (
    settingId: string,
    channel: string,
    checked: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [settingId]: checked
        ? [...(prev[settingId] || []), channel]
        : (prev[settingId] || []).filter((c) => c !== channel),
    }));
  };

  const activeCategoryData = notificationCategories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">알림 설정</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 카테고리 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">알림 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notificationCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* 설정 상세 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {activeCategoryData?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeCategoryData?.settings.map((setting) => (
              <div key={setting.id} className="space-y-3">
                <div>
                  <h4 className="font-medium">{setting.label}</h4>
                  <p className="text-muted-foreground text-sm">
                    {setting.description}
                  </p>
                </div>
                <div className="space-y-2">
                  {setting.channels.map((channel) => {
                    const channelLabels: Record<string, string> = {
                      notification_talk: '알림톡',
                      email: '이메일',
                      sms: 'SMS',
                    };
                    const isChecked =
                      settings[setting.id]?.includes(channel) || false;

                    return (
                      <div
                        key={channel}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${setting.id}-${channel}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleChannelChange(
                              setting.id,
                              channel,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${setting.id}-${channel}`}
                          className="font-normal text-sm"
                        >
                          {channelLabels[channel]}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>설정 저장</Button>
      </div>
    </div>
  );
}
