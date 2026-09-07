'use client';

import { createContext, useContext, useState } from 'react';

type TabType = 'summary' | 'buildings' | 'requests' | 'documents';

interface LandlordDetailContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  landlordId: number;
}

const LandlordDetailContext = createContext<
  LandlordDetailContextType | undefined
>(undefined);

interface LandlordDetailProviderProps {
  children: React.ReactNode;
  landlordId: number;
}

export function LandlordDetailProvider({
  children,
  landlordId,
}: LandlordDetailProviderProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  return (
    <LandlordDetailContext.Provider
      value={{
        activeTab,
        setActiveTab,
        landlordId,
      }}
    >
      {children}
    </LandlordDetailContext.Provider>
  );
}

export function useLandlordDetail() {
  const context = useContext(LandlordDetailContext);
  if (context === undefined) {
    throw new Error(
      'useLandlordDetail must be used within a LandlordDetailProvider'
    );
  }
  return context;
}
