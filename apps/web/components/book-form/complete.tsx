import { weekDayToString } from '@/utils/common';
import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { type BookFormSchema, SPACE_TYPES } from '.';

export default function Complete() {
  const form = useFormContext<BookFormSchema>();
  const name = form.watch('name');
  const date = form.watch('date');
  const time = form.watch('time');
  const buildingCode = form.watch('buildingCode');
  const spaceType = form.watch('spaceType');

  const weekDay = dayjs()
    .year(date.year)
    .month(date.month)
    .date(date.day)
    .day();

  const amPm = time.hour >= 12 ? '오후' : '오전';

  const data = [
    {
      label: '타입',
      value: SPACE_TYPES.find((item) => item.value === spaceType)?.label,
    },
    {
      label: '성함',
      value: name,
    },
    {
      label: '일자',
      value: `${date.year}년 ${date.month + 1}월 ${date.day}일 ${weekDayToString(weekDay)}요일`,
    },
    {
      label: '시간',
      value: `${amPm} ${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`,
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-[30px] flex size-[40px] items-center justify-center rounded-full bg-apc-orange-400">
        <CheckIcon className="size-[24px] stroke-2 text-white-200" />
      </div>

      <h2 className="subtitle-2xl-medium mb-[12px] text-center">
        브리카 {buildingCode}동<br />
        예약이 완료되었습니다!
      </h2>
      <h5 className="body-sm-regular mb-[60px] text-center">
        예약 변경이 필요한 경우, 카카오톡 채널 혹은 이메일로 연락주세요
      </h5>
      <ul className="body-sm-regular flex w-full max-w-[446px] flex-col gap-[8px] border bg-white-100 px-[16px] py-[14px]">
        {data.map((row) => (
          <li key={row.label} className="body-sm-regular flex justify-between">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
