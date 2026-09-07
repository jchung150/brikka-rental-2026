export default async function BillingPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <>{slug}</>;
}
