import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';

type SectionContainerProps = {
  title: string;
  children: React.ReactNode;
};
export const SectionContainer = ({
  title,
  children,
}: SectionContainerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
