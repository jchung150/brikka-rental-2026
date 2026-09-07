import { Resend } from 'resend';
import { keys } from './keys';
import { TenantWelcomeTemplate } from './templates/tenant-welcome';

export const resend = new Resend(keys().RESEND_TOKEN);

type SendTenantWelcomeEmailParams = {
  tenantEmail: string;
  tenantName: string;
  buildingName: string;
  unitNumber: string;
  floor?: number | null;
  startDate: Date;
  endDate: Date;
  temporaryPassword: string;
};

export async function sendTenantWelcomeEmail(
  params: SendTenantWelcomeEmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const env = keys();

    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: params.tenantEmail,
      subject: '입주를 환영합니다 - 입주자 포털 안내',
      react: TenantWelcomeTemplate({
        tenantName: params.tenantName,
        buildingName: params.buildingName,
        unitNumber: params.unitNumber,
        floor: params.floor,
        startDate: params.startDate.toLocaleDateString('ko-KR'),
        endDate: params.endDate.toLocaleDateString('ko-KR'),
        temporaryPassword: params.temporaryPassword,
        portalUrl: env.USER_PORTAL_URL,
      }),
    });

    if (error) {
      console.error('[sendTenantWelcomeEmail] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[sendTenantWelcomeEmail] Email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[sendTenantWelcomeEmail] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
