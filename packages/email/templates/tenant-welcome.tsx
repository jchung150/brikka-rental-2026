import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type TenantWelcomeTemplateProps = {
  readonly tenantName: string;
  readonly buildingName: string;
  readonly unitNumber: string;
  readonly floor?: number | null;
  readonly startDate: string;
  readonly endDate: string;
  readonly temporaryPassword: string;
  readonly portalUrl: string;
};

export const TenantWelcomeTemplate = ({
  tenantName,
  buildingName,
  unitNumber,
  floor,
  startDate,
  endDate,
  temporaryPassword,
  portalUrl,
}: TenantWelcomeTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>입주를 환영합니다 - 입주자 포털 안내</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                {tenantName}님, 입주를 환영합니다! 🎉
              </Text>
              
              <Text className="m-0 text-zinc-700">
                {buildingName}의 계약이 완료되었습니다.
              </Text>

              <Hr className="my-4" />

              <Section className="mb-6">
                <Text className="mb-2 font-semibold text-zinc-900">계약 정보</Text>
                <Text className="m-0 mb-1 text-zinc-600">
                  <strong>건물:</strong> {buildingName}
                </Text>
                <Text className="m-0 mb-1 text-zinc-600">
                  <strong>호실:</strong> {floor ? `${floor}층 ` : ''}{unitNumber}
                </Text>
                <Text className="m-0 mb-1 text-zinc-600">
                  <strong>계약 기간:</strong> {startDate} ~ {endDate}
                </Text>
              </Section>

              <Hr className="my-4" />

              <Section className="mb-6">
                <Text className="mb-2 font-semibold text-zinc-900">입주자 포털 로그인 정보</Text>
                <Text className="m-0 mb-3 text-zinc-600">
                  입주자 포털에서 청구서 확인, 수선 요청, 공지사항 등을 확인하실 수 있습니다.
                </Text>
                
                <Section className="rounded-md bg-zinc-100 p-4">
                  <Text className="m-0 mb-2 text-sm text-zinc-700">
                    <strong>임시 비밀번호:</strong>
                  </Text>
                  <Text className="m-0 font-mono text-lg text-zinc-950">
                    {temporaryPassword}
                  </Text>
                </Section>

                <Text className="mt-3 mb-4 text-sm text-amber-700">
                  ⚠️ 보안을 위해 첫 로그인 후 반드시 비밀번호를 변경해 주세요.
                </Text>

                <Button
                  href={portalUrl}
                  className="rounded-md bg-zinc-900 px-6 py-3 font-semibold text-white"
                >
                  포털 로그인하기
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 text-sm text-zinc-500">
                문의사항이 있으시면 관리실로 연락해 주세요.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleTenantWelcomeEmail = () => (
  <TenantWelcomeTemplate
    tenantName="홍길동"
    buildingName="브리카 레지던스"
    unitNumber="502호"
    floor={5}
    startDate="2025-01-01"
    endDate="2025-12-31"
    temporaryPassword="Abc12345"
    portalUrl="https://portal.example.com"
  />
);

export default ExampleTenantWelcomeEmail;

