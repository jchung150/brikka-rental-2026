import { getContactConfig } from '@/@actions/contacts/getContactConfig';
import { ContactConfigForm } from './_components/contact-config-form';

export default async function ContactConfigPage() {
  const configResult = await getContactConfig();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">문의 가능 시간 설정</h1>
        <p className="text-muted-foreground">
          투어 예약 가능한 운영 시간을 설정합니다.
        </p>
      </div>

      <ContactConfigForm
        initialConfig={configResult.ok ? configResult.data : null}
      />
    </div>
  );
}
