'use client';

import type { BuildingDto } from '@/@data/building';
import { createContext, useContext, useState } from 'react';

type BuildingEditDialog = {
  type: 'edit';
  building: BuildingDto;
};

type BuildingsContextType = {
  dialog: BuildingEditDialog | null;
  setDialog: (dialog: BuildingEditDialog | null) => void;
};

const BuildingsContext = createContext<BuildingsContextType | null>(null);

export const BuildingsProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [dialog, setDialog] = useState<BuildingEditDialog | null>(null);
  return (
    <BuildingsContext.Provider value={{ dialog, setDialog }}>
      {children}
    </BuildingsContext.Provider>
  );
};

export const useBuildingsContext = () => {
  const context = useContext(BuildingsContext);
  if (!context) {
    throw new Error(
      'useBuildingsContext must be used within a BuildingsProvider'
    );
  }
  return context;
};
