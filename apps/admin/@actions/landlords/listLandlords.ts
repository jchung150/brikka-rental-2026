'use server';

import type { Result } from '@repo/common/types';
import { database } from '@repo/database';

export interface LandlordListItem {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  managementContractStartDate: Date | null;
  managementContractEndDate: Date | null;
  isPortalInvited: boolean;
  ownedBuildings: {
    id: number;
    name: string;
  }[];
}

export async function listLandlords(): Promise<Result<LandlordListItem[]>> {
  try {
    const landlords = await database.user.findMany({
      where: {
        userRole: 'LANDLORD',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImageUrl: true,
        managementContractStartDate: true,
        managementContractEndDate: true,
        lastLoggedAt: true,
        BuildingOwnerships: {
          select: {
            Building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedLandlords: LandlordListItem[] = landlords.map(
      (landlord) => ({
        id: Number(landlord.id),
        name: landlord.name,
        email: landlord.email,
        phoneNumber: landlord.phoneNumber,
        profileImageUrl: landlord.profileImageUrl,
        managementContractStartDate: landlord.managementContractStartDate,
        managementContractEndDate: landlord.managementContractEndDate,
        isPortalInvited: landlord.lastLoggedAt !== null,
        ownedBuildings: landlord.BuildingOwnerships.map((ownership) => ({
          id: Number(ownership.Building.id),
          name: ownership.Building.name,
        })),
      })
    );

    return {
      ok: true,
      data: formattedLandlords,
    };
  } catch (error) {
    console.error('[listLandlords] error:', error);
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: '임대인 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}
