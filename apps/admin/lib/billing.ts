import type { LeaseBillingSchedule } from '@repo/database/generated/client';
import dayjs from 'dayjs';

export function getNextBillingDate(schedule: LeaseBillingSchedule): Date {
  const now = dayjs();
  const dueDate = dayjs(schedule.dueDate);

  // 비정기 청구인 경우 원래 납부일 반환
  if (schedule.recurrenceType === 'ONE_TIME') {
    return schedule.dueDate;
  }

  // 정기 청구인 경우 반복 주기에 따라 다음 납부일 계산
  if (schedule.recurrenceType === 'RECURRING' && schedule.recurrencePeriod) {
    let nextBillingDate = dueDate;

    // 현재 날짜보다 이전인 경우 다음 주기로 이동
    while (nextBillingDate.isBefore(now, 'day')) {
      switch (schedule.recurrencePeriod) {
        case 'MONTHLY':
          nextBillingDate = nextBillingDate.add(1, 'month');
          break;
        case 'QUARTERLY':
          nextBillingDate = nextBillingDate.add(3, 'month');
          break;
        default:
          // 기본적으로 월별 처리
          nextBillingDate = nextBillingDate.add(1, 'month');
          break;
      }
    }

    // 반복 종료일이 설정된 경우 체크
    if (
      schedule.recurrenceEndDate &&
      nextBillingDate.isAfter(dayjs(schedule.recurrenceEndDate), 'day')
    ) {
      return schedule.recurrenceEndDate;
    }

    return nextBillingDate.toDate();
  }

  // 기본적으로 원래 납부일 반환
  return schedule.dueDate;
}
