'use client';
import { buildingsForExcel } from '@/@actions/buildings/listBuildings';
import type { BuildingDto } from '@/@data/building';
import { ExcelDownload } from '@/components/excel-download';
import type { Table } from '@tanstack/react-table';
import CreateBuildingDialog from './create-building-dialog';

export function BuildingsToolbar({ table }: { table: Table<BuildingDto> }) {
  return (
    <div className="flex w-full items-center justify-between">
      <div />
      <div className="flex gap-2">
        <CreateBuildingDialog />
        <ExcelDownload
          filename="건물-목록"
          downloadFn={buildingsForExcel}
          headers={[
            { id: 'id', label: 'ID' },
            { id: 'name', label: '건물 이름' },
            { id: 'address', label: '주소' },
            { id: 'managerName', label: '건물 관리자 이름' },
            { id: 'landlordName', label: '임대인 이름' },
            { id: 'buildingType', label: '건물 유형' },
          ]}
        />
      </div>
    </div>
  );
}
