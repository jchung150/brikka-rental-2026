'use client';

import { createContact } from '@/@actions/contacts/createContact';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@repo/design-system/components/ui/form';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { cn } from '@repo/design-system/lib/utils';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import BrikkaSelect from '../brikka-select';
import { SectionCaption, SectionSubtitle, SectionTitle } from '../common';
import BasicInfoField from './basic-info-field';
import Complete from './complete';
import ContactInfo from './contact-info';
import DateSelect from './date-select';
import DesktopVerticalDivider from './desktop-vertical-divider';
import MobileHorizontalDivider from './mobile-horizontal-divider';
import TimeSelect from './time-select';

export const SPACE_TYPES = [
  { label: '주거', value: 'residential' },
  { label: '오피스', value: 'office' },
];

const formSchema = z
  .object({
    date: z.object({
      year: z.number(),
      month: z.number(),
      day: z.number(),
    }),
    time: z.object({
      hour: z.number(),
      minute: z.number(),
    }),
    name: z.string().min(1, '이름을 입력해주세요'),
    email: z.string().email('이메일 형식이 올바르지 않습니다'),
    phone: z.string().min(1, '전화번호를 입력해주세요'),
    referralSource: z.string().min(1, '알게된 경로를 입력해 주세요.'),
    memo: z.string().optional(),
    agreement: z.boolean().optional(),
    buildingCode: z.string().min(1, '건물 코드를 입력해주세요'),
    spaceType: z.enum(['residential', 'office']),
  })
  .refine((data) => data.agreement === true, {
    path: ['agreement'],
    message: '약관에 동의해 주세요',
  });

export type BookFormSchema = z.infer<typeof formSchema>;

export function resolveYearMonthKey(key: string) {
  return key.split('-').map(Number);
}

export function yearMonthKeyOf(year: number, month: number) {
  return `${year}-${month}`;
}

function BuildingSelect() {
  const form = useFormContext<BookFormSchema>();

  return (
    <FormField
      control={form.control}
      name="buildingCode"
      render={({ field }) => {
        return (
          <FormItem>
            <FormControl>
              <BrikkaSelect
                value={field.value}
                onValueChange={field.onChange}
                values={[
                  { label: '브리카 A동', value: 'A' },
                  { label: '브리카 B동', value: 'B' },
                ]}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

function TypeSelect() {
  const form = useFormContext<BookFormSchema>();

  return (
    <FormField
      control={form.control}
      name="spaceType"
      render={({ field }) => {
        return (
          <FormItem>
            <FormControl>
              <BrikkaSelect
                value={field.value}
                onValueChange={field.onChange}
                values={[
                  { label: '주거', value: 'residential' },
                  { label: '오피스', value: 'office' },
                ]}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

function Mobile({
  step,
  submitting,
  goTime,
  goBasicInfo,
}: {
  step: 'time' | 'basic-info' | 'complete';
  submitting: boolean;
  goTime: () => void;
  goBasicInfo: () => void;
}) {
  const handleTimeSelect = useCallback(() => {
    goBasicInfo();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [goBasicInfo]);

  if (step === 'time') {
    return (
      <div className="space-y-[50px]">
        <ContactInfo />
        <MobileHorizontalDivider />
        <DateSelect />
        <MobileHorizontalDivider />
        <TimeSelect handleNext={handleTimeSelect} />
      </div>
    );
  }

  return <BasicInfoField goTime={goTime} submitting={submitting} />;
}

function Desktop({
  step,
  submitting,
  goTime,
  goBasicInfo,
}: {
  step: 'time' | 'basic-info' | 'complete';
  submitting: boolean;
  goTime: () => void;
  goBasicInfo: () => void;
}) {
  if (step === 'time') {
    return (
      <div className="grid grid-cols-[225fr_140fr_406fr_140fr_200fr]">
        <ContactInfo />
        <DesktopVerticalDivider />
        <DateSelect />
        <DesktopVerticalDivider />
        <TimeSelect handleNext={goBasicInfo} />
      </div>
    );
  }

  return <BasicInfoField goTime={goTime} submitting={submitting} />;
}

export default function BookForm() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<'time' | 'basic-info' | 'complete'>('time');
  const [submitting, setSubmitting] = useState(false);

  const stepRouter = useMemo(
    () => ({
      goTime: () => setStep('time'),
      goBasicInfo: () => setStep('basic-info'),
      goComplete: () => setStep('complete'),
    }),
    []
  );

  const form = useForm<BookFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: {
        year: dayjs().year(),
        month: dayjs().month(),
        day: undefined,
      },
      time: {
        hour: undefined,
        minute: undefined,
      },
      name: '',
      email: '',
      phone: '',
      referralSource: '',
      memo: undefined,
      agreement: undefined,
      buildingCode: 'A',
      spaceType: 'residential',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { date, time, name, email, phone, referralSource, memo } = data;
    const { year, month, day } = date;
    const { hour, minute } = time;

    setSubmitting(true);
    const resp = await createContact({
      name,
      email,
      phoneNumber: phone,
      howDidYouFind: referralSource,
      memo,
      reservationTime: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00Z`,
      dong: data.buildingCode,
      type: data.spaceType,
    });

    if (!resp.ok) {
      console.error(resp.code, resp.message);
      toast.error(resp.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    stepRouter.goComplete();
  };

  return (
    <section
      className={cn('layout-horizontal', {
        'p-section-vertical': step === 'time',
        'py-[50px] lg:py-[120px]': step !== 'time',
      })}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 'time' && (
            <div>
              <div className="mb-[50px]">
                <SectionCaption>BOOK</SectionCaption>
                <SectionTitle>브리카의 첫인상을 직접 경험하세요</SectionTitle>
                <SectionSubtitle>
                  사전 예약을 통해 공간을 둘러볼 수 있습니다.
                </SectionSubtitle>
              </div>
              <div className="mb-[50px] flex gap-[24px]">
                <BuildingSelect />
                <TypeSelect />
              </div>
            </div>
          )}

          {step === 'complete' && <Complete />}
          {step !== 'complete' && isMobile && (
            <Mobile
              step={step}
              submitting={submitting}
              goTime={stepRouter.goTime}
              goBasicInfo={stepRouter.goBasicInfo}
            />
          )}
          {step !== 'complete' && !isMobile && (
            <Desktop
              step={step}
              submitting={submitting}
              goTime={stepRouter.goTime}
              goBasicInfo={stepRouter.goBasicInfo}
            />
          )}
        </form>
      </Form>
    </section>
  );
}
