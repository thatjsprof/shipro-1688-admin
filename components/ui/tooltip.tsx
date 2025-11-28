import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useBreakpointBelow from "@/hooks/use-breakpoint";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function BaseTooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  arrowClassName,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  arrowClassName?: string;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state-closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            arrowClassName
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

// Adaptive tooltip component using shadcn Dialog and Popover
interface AdaptiveTooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  isMobile?: boolean;
  mobileVariant?: "dialog" | "popover";
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Tooltip({
  children,
  content,
  mobileVariant = "popover",
  className,
  contentClassName,
  arrowClassName,
  side = "top",
  sideOffset = 4,
  align,
  alignOffset,
  delayDuration = 0,
  skipDelayDuration,
  disableHoverableContent,
  open,
  defaultOpen,
  onOpenChange,
}: AdaptiveTooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isMobile = useBreakpointBelow("sm");

  const shouldUseMobile = isMobile;
  const isControlled = open !== undefined;
  const openState = isControlled ? open : internalOpen;
  const setOpenState = isControlled
    ? onOpenChange || (() => {})
    : setInternalOpen;

  // Ensure children is a single valid React element
  const validChild = React.isValidElement(children) ? (
    children
  ) : (
    <span>{children}</span>
  );

  // Mobile dialog variant
  if (shouldUseMobile && mobileVariant === "dialog") {
    return (
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogTrigger asChild>{validChild}</DialogTrigger>
        <DialogContent className={cn("sm:max-w-lg", contentClassName)}>
          <div className="text-sm">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile popover variant
  if (shouldUseMobile && mobileVariant === "popover") {
    return (
      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>{validChild}</PopoverTrigger>
        <PopoverContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          className={cn("w-72", contentClassName)}
        >
          <div className="text-sm">{content}</div>
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop tooltip - using primitives directly with all props
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>
          {validChild}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            className={cn(
              "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
              contentClassName
            )}
          >
            {content}
            <TooltipPrimitive.Arrow
              className={cn(
                "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
                arrowClassName
              )}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  BaseTooltip,
};
