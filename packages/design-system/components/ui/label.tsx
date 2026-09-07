"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"

import { cn } from "@repo/design-system/lib/utils"
import { Asterisk } from "lucide-react"

function Label({
  className,
  required = false,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  return (
    <div className="flex flex-row">
    <LabelPrimitive.Root
      data-slot="label"
      data-required={required}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
    {required && (
      <Asterisk
          className={cn("text-destructive")}
          size={12}
      />
    )}
    </div>
  )
}

export { Label }
