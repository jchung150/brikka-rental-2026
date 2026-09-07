'use client';

import { createContext, useContext, useState } from 'react';

type TabType = 'summary' | 'requests' | 'documents' | 'notifications';

interface TenantDetailContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tenantId: number;
}

const TenantDetailContext = createContext<TenantDetailContextType | undefined>(
  undefined
);

interface TenantDetailProviderProps {
  children: React.ReactNode;
  tenantId: number;
}

export function TenantDetailProvider({
  children,
  tenantId,
}: TenantDetailProviderProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  return (
    <TenantDetailContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tenantId,
      }}
    >
      {children}
    </TenantDetailContext.Provider>
  );
}

export function useTenantDetail() {
  const context = useContext(TenantDetailContext);
  if (context === undefined) {
    throw new Error(
      'useTenantDetail must be used within a TenantDetailProvider'
    );
  }
  return context;
}
