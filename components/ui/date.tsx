"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
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
  error?: boolean;
  buttonClassName?: string;
  disabled?: boolean;
  enableTime?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  error,
  onChange,
  placeholder = "Select date",
  className = "",
  buttonClassName = "",
  disabled = false,
  enableTime = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value
  );
  const [hours, setHoursState] = React.useState<number>(
    value?.getHours() ?? new Date().getHours()
  );
  const [minutes, setMinutesState] = React.useState<number>(
    value?.getMinutes() ?? new Date().getMinutes()
  );

  React.useEffect(() => {
    setInternalDate(value);
    if (value) {
      setHoursState(value.getHours());
      setMinutesState(value.getMinutes());
    }
  }, [value]);

  const handleSelect = (d: Date | undefined) => {
    if (d && enableTime) {
      const dateWithTime = setMinutes(setHours(d, hours), minutes);
      setInternalDate(dateWithTime);
      onChange?.(dateWithTime);
    } else {
      setInternalDate(d);
      if (!enableTime) {
        onChange?.(d);
        setOpen(false);
      }
    }
  };

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHoursState(newHours);
    setMinutesState(newMinutes);
    if (internalDate) {
      const updatedDate = setMinutes(
        setHours(internalDate, newHours),
        newMinutes
      );
      setInternalDate(updatedDate);
      onChange?.(updatedDate);
    }
  };

  const formatDisplay = (date: Date) => {
    if (enableTime) {
      return format(date, "MMM d, yyyy, hh:mm a");
    }
    return format(date, "PPP");
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            `border-zinc-300 shadow-none focus-visible:border-primary data-[state=open]:border-primary data-[state=open]:outline-none data-[state=open]:outline-offset-0 px-3 py-1 hover:border-zinc-400 !bg-transparent flex justify-start h-11`,
            buttonClassName,
            error && "border-destructive"
          )}
        >
          {internalDate ? (
            formatDisplay(internalDate)
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
        {enableTime && (
          <div className="p-3 border-t border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <label className="text-xs text-zinc-600 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) =>
                    handleTimeChange(
                      Math.max(0, Math.min(23, parseInt(e.target.value) || 0)),
                      minutes
                    )
                  }
                  className="w-16 px-2 py-1 text-center border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <span className="text-2xl font-semibold text-zinc-400 mt-5">
                :
              </span>
              <div className="flex flex-col items-center">
                <label className="text-xs text-zinc-600 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) =>
                    handleTimeChange(
                      hours,
                      Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    )
                  }
                  className="w-16 px-2 py-1 text-center border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
