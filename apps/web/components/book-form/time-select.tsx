import { useBookContextState } from '@/app/(pages)/book/_context';
import { weekDayToString } from '@/utils/common';
import { Button } from '@repo/design-system/components/ui/button';
import { FormControl, FormField } from '@repo/design-system/components/ui/form';
import { cn } from '@repo/design-system/lib/utils';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import type { BookFormSchema } from '.';

function useTimeSlots() {
  const { start, end } = useBookContextState();

  const [startHourStr, startMinuteStr] = start.split(':');
  const [endHourStr, endMinuteStr] = end.split(':');

  const startHour = Number.parseInt(startHourStr);
  const startMinute = Number.parseInt(startMinuteStr);
  const endHour = Number.parseInt(endHourStr);
  const endMinute = Number.parseInt(endMinuteStr);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  const slots: { hour: number; minute: number; label: string }[] = [];

  for (let total = startTotal; total < endTotal; total += 30) {
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    const label = `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
    slots.push({ hour, minute, label });
  }

  return slots;
}

export default function TimeSelect({ handleNext }: { handleNext: () => void }) {
  const timeSlots = useTimeSlots();
  const form = useFormContext<BookFormSchema>();
  const { year, month, day } = form.watch('date');
  const weekDay = day ? dayjs().year(year).month(month).date(day).day() : null;

  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => {
        return (
          <FormControl id="time-select">
            <div>
              <div className="mb-[24px] grid grid-cols-[110fr_200fr] gap-x-[25px] gap-y-[45px] md:mb-[45px] md:grid-cols-1">
                <div>
                  <h3 className="subtitle-2xl-medium mb-[10px]">시간 선택</h3>
                  <div className="body-base-medium">
                    {weekDay
                      ? `${month + 1}월 ${day}일 ${weekDayToString(weekDay)}요일`
                      : '날짜를 선택해 주세요.'}
                  </div>
                </div>
                <div className="flex h-[360px] flex-col overflow-y-auto lg:h-[360px]">
                  {timeSlots.map((slot) => {
                    const isSelected =
                      field.value.hour === slot.hour &&
                      field.value.minute === slot.minute;
                    return (
                      <Button
                        type="button"
                        key={slot.label}
                        variant="apc-outlined"
                        size="apc-md"
                        className={cn(
                          'w-full justify-start rounded-none border-[#DEE3E8] border-b-0 px-[20px] last:border-b',
                          {
                            'bg-apc-black-900 text-white-100 hover:bg-apc-black-900 hover:text-white-100':
                              isSelected,
                          }
                        )}
                        onClick={() =>
                          field.onChange({
                            hour: slot.hour,
                            minute: slot.minute,
                          })
                        }
                        disabled={!day}
                      >
                        <span className="body-base-medium">{slot.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Button
                type="button"
                variant="apc-filled"
                size="apc-md"
                disabled={
                  field.value.hour === undefined ||
                  field.value.minute === undefined
                }
                onClick={handleNext}
                className="w-full"
              >
                다음
              </Button>
            </div>
          </FormControl>
        );
      }}
    />
  );
}
