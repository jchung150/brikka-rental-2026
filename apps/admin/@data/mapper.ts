import type { BuildingDetailEntity } from '@/@actions/buildings/getDetail';
import type { BuildingEntity } from '@/@actions/buildings/listBuildings';
import type { Prisma } from '@repo/database';
import type {
  BuildingDetailDto,
  BuildingDto,
  BuildingOwnershipDto,
  SimpleUserDto,
} from './building';

export const buildingDetailToDtoMapper = (
  building: BuildingDetailDto
): BuildingDto => {
  return {
    id: building.id.toString(),
    zipcode: building.zipcode || '',
    name: building.name,
    address: building.address,
    addressDetail: building.addressDetail || '',
    buildingType: building.buildingType || '',
    manager: building.Manager ? simpleUserMapper(building.Manager) : null,
    ownerships: building.Ownerships,
    accountBank: building.accountBank || '',
    accountNumber: building.accountNumber || '',
    accountHolder: building.accountHolder || '',
    thumbnailUrl: building.thumbnailUrl || '',
    isParkingAvailable: building.isParkingAvailable,
    heatingType: building.heatingType || '',
    description: building.description || '',
    constructionDate: building.constructionDate || undefined,
    approvalDate: building.approvalDate || undefined,
    hasElevator: building.hasElevator,
    updatedAt: building.updatedAt.toISOString(),
  };
};

export const buildingMapper = (building: BuildingEntity): BuildingDto => {
  return {
    id: building.id.toString(),
    zipcode: building.zipcode || '',
    name: building.name,
    address: building.address,
    addressDetail: building.addressDetail || '',
    buildingType: building.buildingType || '',
    manager: building.Manager
      ? simpleUserMapper({
          id: BigInt(building.Manager.id),
          name: building.Manager.name,
        })
      : null,
    ownerships: building.Ownerships.map(buildingOwnershipMapper),
    accountBank: building.accountBank || '',
    accountNumber: building.accountNumber || '',
    accountHolder: building.accountHolder || '',
    thumbnailUrl: building.thumbnailUrl || '',
    isParkingAvailable: building.isParkingAvailable,
    heatingType: building.heatingType || '',
    description: building.description || '',
    constructionDate: building.constructionDate || undefined,
    approvalDate: building.approvalDate || undefined,
    hasElevator: building.hasElevator,
    updatedAt: building.updatedAt.toISOString(),
  };
};

export const buildingOwnershipMapper = (
  ownership: Prisma.BuildingOwnershipGetPayload<{
    include: {
      Landlord: true;
    };
  }>
): BuildingOwnershipDto => {
  return {
    id: ownership.id.toString(),
    ownershipPercentage: ownership.ownershipPercentage,
    landlordId: ownership.Landlord.id.toString(),
    landlordName: ownership.Landlord.name || '',
  };
};

export const simpleUserMapper = (user: {
  id: bigint;
  name: string | null;
}): SimpleUserDto => {
  return {
    id: Number(user.id),
    name: user.name || '',
  };
};

export const buildingDetailMapper = (
  building: BuildingDetailEntity
): BuildingDetailDto => {
  return {
    ...building,
    Ownerships: building.Ownerships.map(buildingOwnershipMapper),
  };
};
