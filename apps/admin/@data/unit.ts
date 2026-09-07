import type {
  Building,
  Unit,
  UnitStatus,
  User,
} from '@repo/database/generated/client';

export type UnitWithDetails = Unit & {
  Building: Pick<Building, 'address' | 'addressDetail'>;
  Leases: Array<{
    Tenant: Pick<User, 'name'> | null;
  }>;
};

export type UnitWithSelectDetails = {
  id: bigint;
  name: string | null;
  unitType: string | null;
  unitNumber: string;
  exclusiveAreaSqm: number | null;
  status: UnitStatus;
  Building: {
    address: string;
    addressDetail: string | null;
  };
  Leases: Array<{
    Tenant: {
      name: string;
    } | null;
  }>;
};

export type UnitListItem = {
  id: number;
  name: string | null;
  unitType: string | null;
  unitNumber: string;
  exclusiveAreaSqm: number | null;
  floor: number | null;
  supplyAreaSqm: number | null;
  serviceAreaSqm: number | null;
  roomCount: number | null;
  bathroomCount: number | null;
  bedroomDirection: string | null;
  status: UnitStatus;
  representativeTenantId: number | null;
  representativeTenantName: string | null;
  address: string;
};

export type UnitFormData = {
  name?: string;
  unitType?: string;
  floor?: number;
  unitNumber: string;
  supplyAreaSqm?: number;
  exclusiveAreaSqm?: number;
  serviceAreaSqm?: number;
  roomCount?: number;
  bathroomCount?: number;
  bedroomDirection?: string;
  status: UnitStatus;
  depositAmount?: number;
  rentAmount?: number;
};

export const unitStatusLabels: Record<UnitStatus, string> = {
  VACANT: '공실',
  OCCUPIED: '사용중',
  RESERVED: '예약중',
  UNDER_CONSTRUCTION: '공사중',
} as const;

export const unitTypeLabels: Record<string, string> = {
  '1룸': '1룸',
  '1.5룸': '1.5룸',
  '2룸': '2룸',
  '3룸': '3룸',
  오피스텔: '오피스텔',
  아파트: '아파트',
} as const;

export function formatArea(exclusiveAreaSqm: number | null): string {
  if (!exclusiveAreaSqm) return '-';

  const pyeong = Math.round(exclusiveAreaSqm / 3.3058);
  return `${exclusiveAreaSqm}m²(${pyeong}평)`;
}

export function getUnitStatusVariant(status: UnitStatus) {
  switch (status) {
    case 'VACANT':
      return 'secondary';
    case 'OCCUPIED':
      return 'default';
    case 'RESERVED':
      return 'default';
    case 'UNDER_CONSTRUCTION':
      return 'default';
    default:
      return 'secondary';
  }
}
