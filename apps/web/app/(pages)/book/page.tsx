import { getContactConfig } from '@/@actions/contacts/getContactConfig';
import BookProvider from '@/app/(pages)/book/_context';
import BookForm from '@/components/book-form';

export default async function BookPage() {
  const contactConfig = await getContactConfig();

  if (!contactConfig.ok) {
    throw new Error(
      `error [CODE]: ${contactConfig.code} / message: ${contactConfig.message}`
    );
  }

  const start = contactConfig.data?.start ?? '09:00';
  const end = contactConfig.data?.end ?? '22:00';

  return (
    <BookProvider start={start} end={end}>
      <BookForm />
    </BookProvider>
  );
}
