import {
  type ListBillingSchedulesInput,
  listBillingSchedules,
} from '@/@actions/lease/listBillingSchedules';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export function useBillingSchedules(input: ListBillingSchedulesInput) {
  return useQuery({
    queryKey: QueryKeys.BillingSchedule.List(input),
    queryFn: () => listBillingSchedules(input),
  });
}
