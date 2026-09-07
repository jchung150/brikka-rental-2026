import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Spinner } from '@repo/design-system/components/ui/spinner';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { AsteriskIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import type { BookFormSchema } from '.';

export const REFERRAL_SOURCES = [
  '인터넷 검색(네이버, 구글 등)',
  '소셜미디어(페이스북, 인스타그램 등)',
  '유튜브/블로그 글',
  '지인 소개',
  '기타 경로',
];

function FieldTitle({ children }: { children: ReactNode }) {
  return <h3 className="body-base-bold mb-[16px]">{children}</h3>;
}

function UserFieldFormLabel({
  isRequired = false,
  children,
}: { isRequired?: boolean; children: ReactNode }) {
  return (
    <FormLabel className="flex w-[90px] shrink-0 justify-end gap-[4px] lg:w-[120px]">
      <div className="body-sm-medium">{children}</div>
      {isRequired && (
        <AsteriskIcon className="-translate-y-[4px] size-[12px] text-destructive" />
      )}
    </FormLabel>
  );
}

function UserFieldFormItem({ children }: { children: ReactNode }) {
  return (
    <FormItem className="flex gap-[8px] lg:flex-row lg:items-center lg:gap-[8px]">
      {children}
    </FormItem>
  );
}

function UserField() {
  const form = useFormContext<BookFormSchema>();
  return (
    <div>
      <FieldTitle>예약에 필요한 기본 정보를 입력해 주세요</FieldTitle>
      <div className="mb-[8px] grid grid-cols-1 gap-x-[10px] gap-y-[8px] lg:grid-cols-2 lg:gap-y-[8px]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <UserFieldFormItem>
              <UserFieldFormLabel isRequired>성함</UserFieldFormLabel>
              <FormControl>
                <Input {...field} className="h-[44px] text-[14px]" />
              </FormControl>
            </UserFieldFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <UserFieldFormItem>
              <UserFieldFormLabel isRequired>이메일</UserFieldFormLabel>
              <FormControl>
                <Input {...field} className="h-[44px] text-[14px]" />
              </FormControl>
            </UserFieldFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <UserFieldFormItem>
              <UserFieldFormLabel isRequired>전화번호</UserFieldFormLabel>
              <FormControl>
                <Input {...field} className="h-[44px] text-[14px]" />
              </FormControl>
            </UserFieldFormItem>
          )}
        />
        <FormField
          control={form.control}
          name="referralSource"
          render={({ field }) => (
            <UserFieldFormItem>
              <UserFieldFormLabel isRequired>알게된 경로</UserFieldFormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="선택" className="h-[44px]" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </UserFieldFormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="memo"
        render={({ field }) => (
          <UserFieldFormItem>
            <UserFieldFormLabel>메모</UserFieldFormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="추가 요청 사항이나 문의사항이 있으시면 적어주세요"
                className="text-[14px]"
              />
            </FormControl>
          </UserFieldFormItem>
        )}
      />
    </div>
  );
}

function AgreementField() {
  const form = useFormContext<BookFormSchema>();
  return (
    <div>
      <FieldTitle>
        계약 현황에 따라 투어시 입주 가능한 호실이 상이할 수 있음에 동의합니다
      </FieldTitle>
      <FormField
        control={form.control}
        name="agreement"
        render={({ field }) => (
          <FormItem className="lg:ml-[30px]">
            <div className="flex items-center gap-[8px]">
              <FormControl>
                <div className="flex items-center gap-[12px]">
                  <Label id="agreement-true">
                    <Checkbox
                      id="agreement-true"
                      className="-translate-y-[2px] data-[state=checked]:bg-apc-black-900"
                      checked={field.value === true}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          return;
                        }
                        field.onChange(checked);
                      }}
                    />
                    <span className="body-sm-regular">동의</span>
                  </Label>
                  <Label id="agreement-true">
                    <Checkbox
                      id="agreement-true"
                      className="-translate-y-[2px] data-[state=checked]:bg-apc-black-900"
                      checked={field.value === false}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          return;
                        }
                        field.onChange(!checked);
                      }}
                    />
                    <span className="body-sm-regular">비동의</span>
                  </Label>
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function Actions({
  submitting,
  goTime,
}: { submitting: boolean; goTime?: () => void }) {
  return (
    <div className="flex w-full gap-[8px] md:gap-[48px]">
      {!!goTime && (
        <Button
          variant="apc-outlined"
          className="h-[62px] flex-1 rounded-none border-[#DEE3E8] font-medium text-[16px] text-coolgray-600 lg:h-[68px] lg:text-[20px]"
          type="button"
          onClick={goTime}
        >
          <span>이전 단계</span>
        </Button>
      )}
      <Button
        variant="apc-filled"
        className="h-[62px] flex-1 rounded-none font-medium text-[16px] lg:h-[68px] lg:text-[20px]"
        type="submit"
        disabled={submitting}
      >
        {submitting ? <Spinner className="size-4" /> : <span>예약하기</span>}
      </Button>
    </div>
  );
}

export default function BasicInfoField({
  submitting,
  goTime,
}: { submitting: boolean; goTime?: () => void }) {
  return (
    <div className="flex flex-col gap-[48px]">
      <UserField />
      <AgreementField />
      <Actions submitting={submitting} goTime={goTime} />
    </div>
  );
}
