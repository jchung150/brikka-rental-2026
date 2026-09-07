'use client';

import { type ListBillsInput, listBills } from '@/@actions/bills/listBills';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useBills(input?: ListBillsInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Bill.List(input),
    queryFn: () => listBills(input || {}),
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
