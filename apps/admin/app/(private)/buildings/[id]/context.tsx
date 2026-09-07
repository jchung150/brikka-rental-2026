'use client';

import type { BuildingDetailDto } from '@/@data/building';
import { useBuildingDetail } from '@/@hooks/use-buildings';
import { createContext, useContext, useState } from 'react';

type CreateLandlordDialog = {
  type: 'create-landlord';
};

type BuildingDetailDialog = CreateLandlordDialog;

type BuildingDetailContextType = {
  building: BuildingDetailDto | null;
  refetch: () => void;
  dialog: BuildingDetailDialog | null;
  setDialog: (dialog: BuildingDetailDialog | null) => void;
};

const BuildingDetailContext = createContext<BuildingDetailContextType>({
  building: null,
  refetch: () => {},
  dialog: null,
  setDialog: () => {},
});

export const EmptyBuildingDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dialog, setDialog] = useState<BuildingDetailDialog | null>(null);
  return (
    <BuildingDetailContext.Provider
      value={{ building: null, refetch: () => {}, dialog, setDialog }}
    >
      {children}
    </BuildingDetailContext.Provider>
  );
};

export const BuildingDetailProvider = ({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) => {
  const { data: building, refetch } = useBuildingDetail(id);
  const [dialog, setDialog] = useState<BuildingDetailDialog | null>(null);

  return (
    <BuildingDetailContext.Provider
      value={{ building: building, refetch: refetch, dialog, setDialog }}
    >
      {children}
    </BuildingDetailContext.Provider>
  );
};

export const useBuildingDetailContext = () => {
  const context = useContext(BuildingDetailContext);
  if (!context) {
    throw new Error(
      'useBuildingDetailContext must be used within a BuildingDetailProvider'
    );
  }
  return context;
};
