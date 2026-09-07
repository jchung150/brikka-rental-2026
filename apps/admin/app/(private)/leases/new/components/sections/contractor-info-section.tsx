'use client';
import SelectBank from '@/components/select-bank';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {} from '@repo/design-system/components/ui/select';
import { useFormContext } from 'react-hook-form';
import type {
  ContractorInfoData,
  TenantInfoData,
} from '../../schemas/lease-form-schema';
import AddressField from './address-field';
import { SectionContainer } from './container';

export function ContractorInfoSection() {
  const { control, watch, setValue } = useFormContext<{
    tenantInfo: TenantInfoData;
    contractorInfo: ContractorInfoData;
  }>();

  const isDifferent = watch('contractorInfo.isDifferent');

  const handleAddressSearch = () => {
    // 주소 검색 로직 구현
    console.log('주소 검색');
  };

  return (
    <SectionContainer title="계약자 정보">
      <div className="space-y-6">
        {/* 대표 입주자 정보 */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700 text-md">대표 입주자</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 입주자 이름 */}
            <FormField
              control={control}
              name="tenantInfo.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>대표 입주자 이름</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="입주자 이름을 입력해 주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 주민등록번호 */}
            <FormField
              control={control}
              name="tenantInfo.ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>주민등록번호</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="주민등록번호를 입력해 주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 연락처 */}
            <FormField
              control={control}
              name="tenantInfo.phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="연락처를 입력해 주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 이메일 */}
            <FormField
              control={control}
              name="tenantInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="이메일을 입력해 주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 주소 */}
            <AddressField
              control={control}
              name="tenantInfo.address"
              label="주소"
              required
            />

            {/* 상세 주소 */}
            <FormField
              control={control}
              name="tenantInfo.addressDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 주소</FormLabel>
                  <FormControl>
                    <Input placeholder="상세 주소를 입력해 주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 계좌 번호 */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={control}
                  name="tenantInfo.accountBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>은행</FormLabel>
                      <FormControl>
                        <SelectBank
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="은행을 선택해 주세요"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="tenantInfo.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>계좌번호</FormLabel>
                      <FormControl>
                        <Input placeholder="000-000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 입주자와 계약자가 다를 경우 */}
        <div className="space-y-4">
          <FormField
            control={control}
            name="contractorInfo.isDifferent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>입주자와 계약자가 다를 경우</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {isDifferent && (
            <div className="space-y-4 border-green-200 border-l-2 pl-6">
              <h3 className="font-medium text-gray-700 text-md">계약자 정보</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* 계약자 이름 */}
                <FormField
                  control={control}
                  name="contractorInfo.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>계약자 이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="입주자 이름을 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약자 주민등록번호 */}
                <FormField
                  control={control}
                  name="contractorInfo.ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>주민등록번호</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="주민등록번호를 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약자 연락처 */}
                <FormField
                  control={control}
                  name="contractorInfo.phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>연락처</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="연락처를 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약자 이메일 */}
                <FormField
                  control={control}
                  name="contractorInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="이메일을 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약자 주소 */}
                <AddressField
                  control={control}
                  name="contractorInfo.address"
                  label="주소"
                  required
                />

                {/* 계약자 상세 주소 */}
                <FormField
                  control={control}
                  name="contractorInfo.addressDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상세 주소</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="상세 주소를 입력해 주세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약자 계좌 번호 */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name="contractorInfo.accountBank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>은행</FormLabel>
                          <FormControl>
                            <SelectBank
                              value={field.value || undefined}
                              onValueChange={field.onChange}
                              placeholder="은행을 선택해 주세요"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="contractorInfo.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>계좌번호</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000-000-0000 (예금주 명)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
