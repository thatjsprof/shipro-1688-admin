import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    error?: boolean;
    EndIcon?: React.ReactNode;
    StartIcon?: React.ReactNode;
    endClassname?: string;
    parentClassname?: string;
    asChild?: boolean;
  }
>(
  (
    {
      className,
      EndIcon,
      StartIcon,
      type,
      asChild,
      parentClassname,
      endClassname,
      error = false,
      ...props
    },
    ref
  ) => {
    if (asChild)
      return (
        <input
          type={type}
          className={cn(
            "w-full border-zinc-300 shadow-none focus-visible:border-primary focus-visible:outline-gray-300 focus-visible:outline-offset-0 hover:border-zinc-400 placeholder:text-gray-400 flex h-11 rounded-md border bg-white px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 !text-sm",
            error && "border-destructive",
            EndIcon && "pr-[2.5rem]",
            StartIcon && "pl-[2.2rem]",
            className
          )}
          ref={ref}
          {...props}
        />
      );

    return (
      <div className={cn("relative w-full", parentClassname)}>
        {StartIcon && (
          <div className="absolute top-1/2 left-[1.5rem] transform -translate-x-1/2 -translate-y-1/2">
            {StartIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full border-zinc-300 shadow-none focus-visible:border-primary focus-visible:outline-gray-300 focus-visible:outline-offset-0 hover:border-zinc-400 placeholder:text-gray-400 flex h-11 rounded-md border bg-white px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm",
            error && "border-destructive",
            EndIcon && "pr-[2.5rem]",
            StartIcon && "pl-[2.6rem]",
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div
            className={cn(
              "absolute top-1/2 right-[.5rem] transform -translate-x-1/2 -translate-y-1/2",
              endClassname
            )}
          >
            {EndIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
