import '@/styles/calendar.css';
import { Calendar } from '@repo/design-system/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { cn } from '@repo/design-system/lib/utils';
import dayjs from 'dayjs';
import { useFormContext } from 'react-hook-form';
import { type BookFormSchema, resolveYearMonthKey, yearMonthKeyOf } from '.';

const AVAILABLE_YEAR_MONTHS = (() => {
  const today = dayjs();
  const dates: { year: number; month: number }[] = [];

  for (let i = 0; i < 12; i++) {
    const date = today.add(i, 'month');
    dates.push({
      year: date.year(),
      month: date.month(),
    });
  }

  return dates;
})();

const mockDisableDays = [1, 2, 5, 6, 7, 12, 13, 14, 20, 21, 22];

export default function DateSelect() {
  const isMobile = useIsMobile();
  const form = useFormContext<BookFormSchema>();

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => {
        const year = field.value.year;
        const month = field.value.month;
        const day = field.value.day;

        const calendarDate = day
          ? dayjs().year(year).month(month).date(day).toDate()
          : undefined;

        return (
          <FormItem className="items-start gap-[16px]">
            <FormLabel>
              <div className="subtitle-2xl-medium">
                원하는 투어 날짜를 선택해주세요.
              </div>
            </FormLabel>
            <FormControl>
              <div className="flex flex-col gap-[14px]">
                <Select
                  value={yearMonthKeyOf(year, month)}
                  onValueChange={(value) => {
                    const [year, month] = resolveYearMonthKey(value);
                    field.onChange({ year, month, day: undefined });
                    form.resetField('time');
                  }}
                >
                  <SelectTrigger className="!h-[48px] w-full [&_svg:not([class*='text-'])]:text-apc-foreground">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {AVAILABLE_YEAR_MONTHS.map((date) => (
                        <SelectItem
                          key={yearMonthKeyOf(date.year, date.month)}
                          value={yearMonthKeyOf(date.year, date.month)}
                        >
                          <span className="body-base-medium">
                            {date.year}년 {date.month + 1}월
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Calendar
                  mode="single"
                  disabled={(date) => {
                    if (calendarDate) {
                      return !dayjs(date).isSame(calendarDate, 'day');
                    }
                    return (
                      mockDisableDays.includes(date.getDate()) ||
                      dayjs(date).day() === 0 ||
                      dayjs(date).day() === 6 ||
                      dayjs(date).isBefore(dayjs(), 'day')
                    );
                  }}
                  selected={calendarDate}
                  month={dayjs().year(year).month(month).toDate()}
                  onSelect={(date) => {
                    if (date) {
                      const year = dayjs(date).year();
                      const month = dayjs(date).month();
                      const day = dayjs(date).date();
                      field.onChange({ year, month, day });
                      if (isMobile) {
                        const el = document.getElementById('time-select');
                        if (el) {
                          el.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }
                      }
                    } else {
                      field.onChange({ year, month, day: undefined });
                    }
                    form.resetField('time');
                  }}
                  className="mx-auto"
                  disableNavigation
                  showOutsideDays={false}
                  classNames={{
                    caption: 'hidden',
                    head_row: 'flex gap-[3px]',
                    head_cell: 'size-[36px] lg:size-[48px] body-sm-regular',
                    row: 'flex w-full mt-2 gap-x-[3px]',
                    cell: cn(
                      'body-sm-regular relative size-[36px] p-0 text-center focus-within:relative focus-within:z-20 lg:size-[48px] [&:has([aria-selected].day-range-end)]:rounded-r-md'
                    ),
                    day: cn(
                      'body-sm-regular size-[36px] rounded-full bg-apc-black-900 p-0 text-white-100 aria-selected:opacity-100 lg:size-[48px]'
                    ),
                    day_selected: 'bg-apc-black-900 text-white-100',
                    day_disabled: 'bg-apc-gray-500 text-coolgray-600 ',
                    day_today: '',
                    day_hidden: 'text-red-500 block visible',
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
