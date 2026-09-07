import { cn } from '@repo/design-system/lib/utils';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        fixed && 'fixed-main flex flex-grow flex-col overflow-hidden'
      )}
      {...props}
    />
  );
};

Main.displayName = 'Main';
