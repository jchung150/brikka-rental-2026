'use client';

import {
  type ListDocumentsInput,
  listDocuments,
} from '@/@actions/documents/listDocuments';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useDocuments(input: ListDocumentsInput) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Document.List(input),
    queryFn: () => listDocuments(input),
  });

  return {
    data: data?.ok ? data.data.items : [],
    lastPage: data?.ok ? data.data.lastPage : 1,
    isLoading,
    error,
    refetch,
  };
}
