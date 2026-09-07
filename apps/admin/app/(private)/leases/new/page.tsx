import { getLeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { Suspense } from 'react';
import { NewLeaseForm } from './components/new-lease-form';
import type { LeaseFormData } from './schemas/lease-form-schema';

interface NewLeasePageProps {
  searchParams: Promise<{ renewFrom?: string }>;
}

async function NewLeaseContent({ renewFrom }: { renewFrom?: string }) {
  let initialData: LeaseFormData | undefined;
  let isRenewal = false;

  if (renewFrom) {
    isRenewal = true;
    try {
      const detail = await getLeaseDetail(Number(renewFrom));
      if (detail.ok) {
        const lease = detail.data;
        const representativeTenant = lease.LeaseTenants.find(
          (tenant) => tenant.isRepresentative
        );
        const regularBilling = lease.BillingSchedules.filter(
          (schedule) => schedule.recurrenceType === 'RECURRING'
        );
        const irregularBilling = lease.BillingSchedules.filter(
          (schedule) => schedule.recurrenceType === 'ONE_TIME'
        );
        // LeaseRenewalData를 LeaseFormData 형태로 변환
        initialData = {
          basicInfo: {
            buildingId: lease.Unit.Building.id.toString(),
            unitId: lease.Unit.id.toString(),
            status: 'PREPARING' as const,
            numberOfOccupants: lease.numberOfOccupants || 0,
            startDate: '',
            endDate: '',
          },
          tenantInfo: {
            name: representativeTenant?.Tenant.name || '',
            ssn: representativeTenant?.Tenant.ssn || '',
            phoneNumber: representativeTenant?.Tenant.phoneNumber || '',
            email: representativeTenant?.Tenant.email || '',
            address: representativeTenant?.Tenant.address || '',
            addressDetail: representativeTenant?.Tenant.addressDetail || '',
            accountBank: representativeTenant?.Tenant.accountBank || '',
            accountNumber: representativeTenant?.Tenant.accountNumber || '',
          },
          contractorInfo: {
            isDifferent: false,
            name: lease.Contractor?.name || '',
            ssn: lease.Contractor?.ssn || '',
            phoneNumber: lease.Contractor?.phoneNumber || '',
            email: lease.Contractor?.email || '',
            address: lease.Contractor?.address || '',
            addressDetail: lease.Contractor?.addressDetail || '',
            accountBank: lease.Contractor?.accountBank || '',
            accountNumber: lease.Contractor?.accountNumber || '',
          },
          additionalInfo: {
            isCorporate: lease.isCorporate || false,
            isForeigner: lease.isForeigner || false,
            isBrokerLinked: lease.isBrokerLinked || false,
            hasVehicle: lease.Vehicles.length > 0,
            hasPet: !!lease.Pet,
            issueTaxInvoice: lease.issueTaxInvoice,
          },
          petInfo: {
            name: '',
            type: '',
            weight: '',
            age: '',
            registrationNumber: '',
          },
          virtualAccount: {
            bank: '농협',
            accountNumber: '',
            accountHolder: '',
          },
          depositInfo: {
            amount: '50000000',
            returnDate: lease.depositReturnDate?.toString() || '',
          },
          billingInfo: {
            regularBilling: regularBilling.map((schedule) => ({
              itemName: schedule.itemName,
              amount: schedule.amount.toString(),
              dueDate: schedule.dueDate.toString(),
              recurrenceType: schedule.recurrenceType,
              recurrencePeriod: schedule.recurrencePeriod || 'MONTHLY',
              periodSetting: 'UNTIL_END' as const,
              isTaxable: schedule.isTaxable,
              notificationDays: schedule.notificationDays || 5,
            })),
            irregularBilling: irregularBilling.map((schedule) => ({
              itemName: schedule.itemName,
              amount: schedule.amount.toString(),
              dueDate: schedule.dueDate.toString(),
              isTaxable: schedule.isTaxable,
              notificationDays: schedule.notificationDays || 5,
            })),
          },
          documentStorage: {
            title: '',
            file: undefined,
            category: '',
            memo: '',
          },
          sendWelcomeEmail: true,
        };
      }
    } catch (error) {
      console.error('Failed to load lease data for renewal:', error);
    }
  }

  return <NewLeaseForm initialData={initialData} isRenewal={isRenewal} />;
}

export default async function NewLeasePage({
  searchParams,
}: NewLeasePageProps) {
  const { renewFrom } = await searchParams;

  return (
    <Suspense fallback={<div>계약 정보를 불러오는 중...</div>}>
      <NewLeaseContent renewFrom={renewFrom} />
    </Suspense>
  );
}
