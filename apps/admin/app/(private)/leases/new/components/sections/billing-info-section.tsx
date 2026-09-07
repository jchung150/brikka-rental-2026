'use client';

import { C } from '@repo/common/constant';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Calendar, Plus, X } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { BillingInfoData } from '../../schemas/lease-form-schema';
import { SectionContainer } from './container';

export function BillingInfoSection() {
  const { control } = useFormContext<{
    billingInfo: BillingInfoData;
  }>();

  const {
    fields: regularBillingFields,
    append: appendRegularBilling,
    remove: removeRegularBilling,
  } = useFieldArray({
    control,
    name: 'billingInfo.regularBilling',
  });

  const {
    fields: irregularBillingFields,
    append: appendIrregularBilling,
    remove: removeIrregularBilling,
  } = useFieldArray({
    control,
    name: 'billingInfo.irregularBilling',
  });

  const handleAddRegularBilling = () => {
    appendRegularBilling({
      itemName: '임대료',
      amount: '',
      dueDate: '',
      recurrenceType: 'RECURRING',
      recurrencePeriod: 'MONTHLY',
      periodSetting: 'UNTIL_END',
      periodCount: undefined,
      isTaxable: true,
      memo: '',
      notificationDays: 5,
    });
  };

  const handleAddIrregularBilling = () => {
    appendIrregularBilling({
      itemName: '임대료',
      amount: '',
      dueDate: '',
      isTaxable: true,
      memo: '',
      notificationDays: 5,
    });
  };

  const handleRemoveRegularBilling = (index: number) => {
    removeRegularBilling(index);
  };

  const handleRemoveIrregularBilling = (index: number) => {
    removeIrregularBilling(index);
  };

  return (
    <SectionContainer title="임대/청구정보">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddRegularBilling}
            >
              <Plus className="mr-2 h-4 w-4" />
              정기 청구 등록
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddIrregularBilling}
            >
              <Plus className="mr-2 h-4 w-4" />
              비정기 청구 등록
            </Button>
          </div>
        </div>

        {/* 정기 청구 섹션들 */}
        {regularBillingFields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700 text-md">
                정기 청구 {index + 1}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRegularBilling(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.itemName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>청구 항목</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="청구 항목을 선택해 주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {C.BILLING_ITEMS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>약정액</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="약정액을 입력해 주세요. 예시 100,000,000원"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.dueDate`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel required>다음 납부일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10"
                          placeholder="다음 납부일을 입력해 주세요"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.recurrencePeriod`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>반복 주기</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="반복 주기를 선택해 주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {C.BILLING_CYCLES.map((cycle) => (
                            <SelectItem key={cycle} value={cycle}>
                              {cycle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.periodSetting`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>기간 설정</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="기간 설정을 선택해 주세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNTIL_END">
                              계약 종료시까지
                            </SelectItem>
                            <SelectItem value="CUSTOM">N회 반복</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value === 'CUSTOM' && (
                          <FormField
                            control={control}
                            name={`billingInfo.regularBilling.${index}.periodCount`}
                            render={({ field: countField }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="횟수"
                                    value={countField.value || ''}
                                    onChange={(e) =>
                                      countField.onChange(
                                        Number.parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.isTaxable`}
                render={({ field }) => (
                  <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>부가세 대상 여부</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.notificationDays`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알림 설정</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                        <span className="shrink-0 text-sm">
                          일 전에 알림톡 보내기
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.regularBilling.${index}.memo`}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>메모</FormLabel>
                    <FormControl>
                      <Textarea placeholder="메모를 입력해 주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        {/* 비정기 청구 섹션들 */}
        {irregularBillingFields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700 text-md">
                비정기 청구(일회성) {index + 1}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveIrregularBilling(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.itemName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>청구 항목</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="청구 항목을 선택해 주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {C.BILLING_ITEMS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>약정액</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="약정액을 입력해 주세요. 예시 100,000,000원"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.dueDate`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel required>다음 납부일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                        <Input
                          type="date"
                          className="pl-10"
                          placeholder="다음 납부일을 선택해 주세요"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.isTaxable`}
                render={({ field }) => (
                  <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>부가세 대상 여부</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.notificationDays`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>알림 설정</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                        <span className="shrink-0 text-sm">
                          일 전에 알림톡 보내기
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`billingInfo.irregularBilling.${index}.memo`}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>메모</FormLabel>
                    <FormControl>
                      <Textarea placeholder="메모를 입력해 주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
