'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { createContext, useContext } from 'react';

type LeaseDetailContextType = {
  detail: LeaseDetail;
};

const LeaseDetailContext = createContext<LeaseDetailContextType | undefined>(
  undefined
);

export function LeaseDetailProvider({
  children,
  detail,
}: { children: React.ReactNode; detail: LeaseDetail }) {
  return (
    <LeaseDetailContext.Provider value={{ detail }}>
      {children}
    </LeaseDetailContext.Provider>
  );
}

export function useLeaseDetail() {
  const context = useContext(LeaseDetailContext);
  if (context === undefined) {
    throw new Error('useLeaseDetail must be used within a LeaseDetailProvider');
  }
  return context;
}

export function useLeaseDetailSafe() {
  return useContext(LeaseDetailContext);
}
