import { useBookContextState } from '@/app/(pages)/book/_context';
import { CircleUserIcon, Clock4Icon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { BookFormSchema } from '.';

export default function ContactInfo() {
  const { start, end } = useBookContextState();
  const form = useFormContext<BookFormSchema>();
  const buildingCode = form.watch('buildingCode');
  return (
    <div>
      <h3 className="subtitle-2xl-medium mb-[14px] lg:mb-[28px]">
        브리카 {buildingCode}동
      </h3>
      <ul className="flex flex-col gap-[10px]">
        <li className="flex items-center gap-[4px]">
          <CircleUserIcon className="-translate-y-[1px] size-[20px] shrink-0" />
          <div className="body-sm-regular">문의 email@email.com</div>
        </li>
        <li className="flex items-center gap-[4px]">
          <Clock4Icon className="-translate-y-[1px] size-[20px] shrink-0" />
          <div className="body-sm-regular">
            투어 운영 시간 {start} - {end}
          </div>
        </li>
      </ul>
    </div>
  );
}
