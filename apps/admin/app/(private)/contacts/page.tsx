import { ContactsTable } from './_components/contacts-table';
import { getContactsData } from './_lib/get-contacts-data';

interface ContactsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ContactsPage({
  searchParams,
}: ContactsPageProps) {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page) : 1;
  const status = params.status as
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | undefined;

  const data = await getContactsData({
    page,
    status,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">문의 목록</h1>
        <p className="text-muted-foreground">투어 예약 문의를 관리합니다.</p>
      </div>

      <ContactsTable initialData={data} />
    </div>
  );
}
