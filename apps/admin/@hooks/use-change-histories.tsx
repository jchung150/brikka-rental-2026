'use client';

import { listChangeHistories } from '@/@actions/history/listChangeHistories';
import { useQuery } from '@tanstack/react-query';

export function useChangeHistories() {
  return useQuery({
    queryKey: ['change-histories'],
    queryFn: listChangeHistories,
  });
}
