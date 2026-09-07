import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('ko');

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const formatters = {
  fileSize: formatFileSize,
  leaseUniqueName: (
    buildingName: string,
    unitNumber: string,
    tenantName: string
  ) => {
    return `${buildingName}-${unitNumber}-${tenantName}`;
  },

  date: (date: Date) => {
    return date.toLocaleDateString('ko-KR');
  },

  dateTime: (date: Date | string) => {
    return format(date, 'yyyy/MM/dd HH:mm', { locale: ko });
  },

  area: (area: number) => {
    return `${area}m²(${Math.round(area / 3.3058)}평)`;
  },

  currency: (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  duration: (duration: number) => {
    return dayjs.duration(duration).humanize();
  },

  remainingDays: (endDate?: Date) => {
    if (!endDate) {
      return '-';
    }

    const now = dayjs();
    const end = dayjs(endDate);

    if (end.isBefore(now, 'day')) {
      return '만료됨';
    }

    const diffInDays = end.diff(now, 'day');

    if (diffInDays === 0) {
      return '오늘 만료';
    }

    if (diffInDays < 30) {
      return `${diffInDays}일 남음`;
    }

    const years = end.diff(now, 'year');
    const months = end.diff(now.add(years, 'year'), 'month');

    if (years > 0) {
      return months > 0 ? `${years}년 ${months}개월 남음` : `${years}년 남음`;
    }

    return `${months}개월 남음`;
  },
};

export const maskFormatter = {
  ssn: (ssn: string) => {
    return ssn.replace(/(\d{6})(\d{4})/, '$1-$2');
  },
};
