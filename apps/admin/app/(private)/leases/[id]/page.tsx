import LeaseDetailBody from './body';

interface LeaseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeaseDetailPage({
  params,
}: LeaseDetailPageProps) {
  const { id } = await params;
  return <LeaseDetailBody id={Number(id)} />;
}
