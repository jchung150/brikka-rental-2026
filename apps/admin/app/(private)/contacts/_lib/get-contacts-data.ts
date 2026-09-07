import { listContacts } from '@/@actions/contacts/listContacts';

export async function getContactsData(params: {
  page?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
}) {
  const result = await listContacts(params);

  if (!result.ok) {
    return {
      contacts: [],
      total: 0,
      page: 1,
      limit: 20,
    };
  }

  return result.data;
}
