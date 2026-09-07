import { getContact } from '@/@actions/contacts/getContact';
import { notFound } from 'next/navigation';
import { ContactDetail } from './_components/contact-detail';

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({
  params,
}: ContactDetailPageProps) {
  const contactId = BigInt((await params).id);
  const result = await getContact(contactId);

  if (!result.ok || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <ContactDetail contact={result.data} />
    </div>
  );
}
