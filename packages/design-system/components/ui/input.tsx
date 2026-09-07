'use client';

import * as React from 'react';
import { cn } from '@repo/design-system/lib/utils';
import { useRef, useState } from 'react';

interface InputProps extends React.ComponentProps<'input'> {
}

function Input({ className, type, ...props }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFile, setHasFile] = useState(false);

  const handleChange = () => {
    const fileList = inputRef.current?.files;
    setHasFile(Boolean(fileList && fileList.length > 0));
  };

  if (type === 'file') {
    return (
      <input
        ref={inputRef}
        type="file"
        data-slot="input"
        onChange={(e) => {
          handleChange();
          props.onChange?.(e);
        }}
        className={cn(
          'file:my-[3px] file:inline-flex file:h-9 file:cursor-pointer file:rounded-[6px] file:border-0 file:bg-coolgray-100 file:px-1.5 file:font-medium file:text-black-900 file:text-sm',
          'flex w-full min-w-0 rounded-md border border-coolgray-200 bg-transparent px-1 text-base shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
          'focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          {
            'text-coolgray-600': !hasFile,
          },
          className
        )}
        {...props}
      />
    );
  }

  return (
     <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
