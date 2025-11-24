import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  error,
  ...props
}: React.ComponentProps<"textarea"> & { error?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-primary aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-[.92rem] shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-zinc-300 shadow-none focus-visible:border-primary focus-visible:outline-gray-300 focus-visible:outline-offset-0 hover:border-zinc-400 placeholder:text-gray-400",
        className,
        error && "border-destructive"
      )}
      {...props}
    />
  );
}

export { Textarea };
