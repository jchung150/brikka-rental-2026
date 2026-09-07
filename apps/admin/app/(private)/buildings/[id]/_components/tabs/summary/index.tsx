import type { BuildingDetailDto } from '@/@data/building';
import { ParkingLotSection } from '../../parking-lot-section';
import { AppliancesFurnitureSection } from './appliances-furniture-section';
import { BasicInfoSection } from './basic-info-section';
import { CommonFacilitiesSection } from './common-facilities-section';

export function Summary({ building }: { building: BuildingDetailDto }) {
  return (
    <div className="space-y-4">
      <BasicInfoSection building={building} />
      <CommonFacilitiesSection building={building} />
      <ParkingLotSection building={building} />
      <AppliancesFurnitureSection building={building} />
    </div>
  );
}
