'use client';

import { listMessages } from '@/@actions/messages';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

interface ListMessagesInput {
  leaseId?: number;
  buildingId?: number;
  billId?: number;
  receiverId?: number;
  method?: string;
  messageType?: string;
  page?: number;
  limit?: number;
}

export function useMessages(input?: ListMessagesInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Message.List(input),
    queryFn: () => listMessages(input || {}),
  });

  return {
    data: data?.ok ? data.data : null,
    isLoading,
    error,
    refetch,
  };
}
