import type { BuildingDetailEntity } from '@/@actions/buildings/getDetail';

export type BuildingDto = {
  id: string;
  name: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  buildingType: string;
  manager: SimpleUserDto | null;
  ownerships: BuildingOwnershipDto[];
  accountBank?: string;
  accountNumber?: string;
  accountHolder?: string;
  thumbnailUrl?: string;
  isParkingAvailable: boolean;
  constructionDate?: Date;
  approvalDate?: Date;
  heatingType?: string;
  description?: string;
  hasElevator: boolean;
  updatedAt: string;
};

export type BuildingOwnershipDto = {
  id: string;
  ownershipPercentage: number;
  landlordId: string;
  landlordName: string;
};

export type SimpleUserDto = {
  id: number;
  name: string;
};

export type BuildingDetailDto = Omit<BuildingDetailEntity, 'Ownerships'> & {
  Ownerships: BuildingOwnershipDto[];
};
