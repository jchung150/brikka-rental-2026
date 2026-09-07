import { RequestsContent } from './_components/requests-content';

interface RequestsPageProps {
  searchParams: Promise<{
    page?: string;
    buildingId?: string;
    status?: string;
    requestType?: string;
  }>;
}

export default async function RequestsPage(props: RequestsPageProps) {
  const params = await props.searchParams;
  return <RequestsContent searchParams={params} />;
}
