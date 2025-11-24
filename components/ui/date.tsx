"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  buttonClassName = "",
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value
  );

  React.useEffect(() => {
    if (value !== undefined) setInternalDate(value);
  }, [value]);

  const handleSelect = (d: Date | undefined) => {
    setInternalDate(d);
    onChange?.(d);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            `border-zinc-300 shadow-none focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:outline-none data-[state=open]:outline-offset-0 px-3 py-1 hover:border-zinc-400 !bg-transparent flex justify-start h-11`,
            buttonClassName
          )}
        >
          {internalDate ? (
            internalDate.toLocaleDateString()
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-auto overflow-hidden p-0 ${className}`}
        align="start"
      >
        <Calendar
          mode="single"
          selected={internalDate}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
