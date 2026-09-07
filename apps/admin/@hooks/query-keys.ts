import type { ApplianceFurnitureCategory } from '@repo/database';

export const Namespace = {
  User: 'user',
  Building: 'building',
  Unit: 'unit',
  Lease: 'lease',
  Bill: 'bill',
  Payment: 'payment',
  Request: 'request',
  Log: 'log',
  Facilities: 'facilities',
  Message: 'message',
};

export const QueryKeys = {
  Lease: {
    Detail: (id: number) => [Namespace.Lease, 'detail', id],
    List: (params: any) => [Namespace.Lease, 'list', JSON.stringify(params)],
  },
  ParkingSpace: {
    List: (...params: unknown[]) => [
      Namespace.Building,
      'parking-space',
      'list',
      ...params,
    ],
  },
  BuildingApplianceFurniture: {
    List: (buildingId: number, scope?: string) => [
      Namespace.Building,
      'appliance-furniture',
      'list',
      buildingId,
      scope,
    ],
  },
  ApplianceFurnitureLocation: {
    List: () => [Namespace.Building, 'appliance-furniture-location', 'list'],
  },
  ApplianceFurnitureManufacturer: {
    List: () => [
      Namespace.Building,
      'appliance-furniture-manufacturer',
      'list',
    ],
  },
  ApplianceFurniture: {
    List: (type: ApplianceFurnitureCategory) => [
      Namespace.Building,
      'appliance-furniture',
      type,
    ],
  },
  Facilities: {
    List: () => [Namespace.Building, Namespace.Facilities, 'list'],
  },
  Building: {
    All: () => [Namespace.Building, 'all'],
    List: (params: any) => [Namespace.Building, 'list', JSON.stringify(params)],
    Detail: (id: number) => [Namespace.Building, 'detail', id],
  },
  User: {
    List: (params: any) => [Namespace.User, 'list', JSON.stringify(params)],
    Detail: (id: number) => [Namespace.User, 'detail', id],
  },
  Unit: {
    List: (...params: unknown[]) => [
      Namespace.Unit,
      'list',
      JSON.stringify(params),
    ],
    Detail: (id: number) => [Namespace.Unit, 'detail', id],
    Name: (id: number) => [Namespace.Unit, 'name', id],
  },
  Request: {
    List: (input: any) => [Namespace.Request, 'list', JSON.stringify(input)],
    Detail: (id: number) => [Namespace.Request, 'detail', id],
    BuildingOwnerships: (userId: string) => [
      Namespace.Request,
      'building-ownerships',
      userId,
    ],
  },
  Document: {
    List: (input: any) => [
      Namespace.Building,
      'document',
      'list',
      JSON.stringify(input),
    ],
    Detail: (id: number) => [Namespace.Building, 'document', 'detail', id],
  },
  Bill: {
    List: (input: any) => [Namespace.Bill, 'list', JSON.stringify(input)],
    Detail: (id: number) => [Namespace.Bill, 'detail', id],
  },
  Message: {
    List: (input: any) => [Namespace.Message, 'list', JSON.stringify(input)],
    Detail: (id: number) => [Namespace.Message, 'detail', id],
  },
  BillingSchedule: {
    List: (input: any) => [
      Namespace.Lease,
      'billing-schedule',
      'list',
      JSON.stringify(input),
    ],
  },
};
