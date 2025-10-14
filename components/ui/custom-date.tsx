import React, { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { format, isToday, startOfDay, subMonths } from "date-fns";
import { endOfDay } from "date-fns";
import { Calendar } from "./calendar";
import { CustomNavigation } from "./custom-nav";

interface CustomDatePickerProps {
  onRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
  wrapperClassName?: string;
  disabledDays?: { before?: Date; after?: Date };
  initialDateRange?: DateRange;
  showToday?: boolean;
  CustomComponent?: ({
    setSelectedRange,
  }: {
    setSelectedRange: (
      value: React.SetStateAction<DateRange | undefined>
    ) => void;
  }) => React.ReactNode;
  showQuickSelects?: boolean;
}

const formatDateRange = (range?: DateRange) => {
  if (!range) return;
  const { from, to } = range;
  if (!from || !to) return "";

  const formattedStart = format(from, "MMM d, yy");
  const formattedEnd = to
    ? isToday(to)
      ? "Today"
      : format(to, "MMM d, yy")
    : "";

  return `${formattedStart} - ${formattedEnd}`;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  onRangeChange,
  className,
  CustomComponent,
  wrapperClassName,
  disabledDays = { before: undefined, after: new Date() },
  initialDateRange = { from: undefined, to: undefined },
  showToday = true,
  showQuickSelects = true,
}) => {
  const today = new Date();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedLoadedRange, setSelectedLoadedRange] = useState<
    DateRange | undefined
  >({
    from: undefined,
    to: undefined,
  });
  const [month, setMonth] = useState<Date>(initialDateRange.from || today);

  const handleQuickSelect = (days: number) => {
    const to = endOfDay(new Date());
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const newRange = { from, to };
    setSelectedRange(newRange);
  };

  const handleMonthSelect = (months: number) => {
    const to = endOfDay(new Date());
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    from.setDate(from.getDate() + 1);
    const newRange = { from, to };
    setSelectedRange(newRange);
  };

  const handleYearSelect = () => {
    const to = endOfDay(new Date());
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    from.setDate(from.getDate() + 1);
    const newRange = { from, to };
    setSelectedRange(newRange);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    if (disabledDays && disabledDays.after) {
      if (range?.from && range.from > startOfDay(today)) {
        return;
      }
    } else {
      if (range?.from && range.from < startOfDay(today)) {
        return;
      }
    }
    if (range?.to) {
      range.to = endOfDay(range.to);
    }

    setSelectedRange(range);
  };

  const rangeStyles = {
    selected: "text-foreground text-sm bg-black font-medium border-none",
    today:
      "border border-black bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
  };

  useEffect(() => {
    setSelectedLoadedRange({
      from: subMonths(new Date(), 1),
      to: new Date(),
    });
  }, []);

  useEffect(() => {
    if (selectedRange?.from && selectedRange.to) {
      if (onRangeChange) {
        onRangeChange(selectedRange);
      }
    }
  }, [selectedRange]);

  useEffect(() => {
    if (initialDateRange.from || initialDateRange.to) {
      if (initialDateRange.from) {
        setMonth(initialDateRange.from);
      }
      setSelectedRange(initialDateRange);
    }
  }, [initialDateRange.from, initialDateRange.to]);

  return (
    <div className={cn("w-fit", wrapperClassName)}>
      <Popover modal={false}>
        <span className="flex items-center gap-2">
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              aria-pressed="true"
              className={cn(
                "w-fit h-11 py-[.6rem] bg-white hover:bg-transparent border-input hover:border-zinc-400 shadow-none flex gap-2 justify-start data-[state=open]:border-secondary data-[state=open]:outline-gray-300 data-[state=open]:outline-none data-[state=open]:outline-offset-0",
                className
              )}
            >
              {selectedRange?.from && selectedRange.to
                ? formatDateRange(selectedRange)
                : formatDateRange(selectedLoadedRange)}
            </Button>
          </PopoverTrigger>
          {showToday && (
            <>
              {selectedRange?.from &&
                selectedRange?.to &&
                !isToday(selectedRange.from) &&
                !isToday(selectedRange.to) && (
                  <Button
                    variant="ghost"
                    className="bg-gray-100 h-11"
                    onClick={() => {
                      setSelectedLoadedRange({
                        from: subMonths(new Date(), 1),
                        to: new Date(),
                      });
                      setSelectedRange({
                        from: undefined,
                        to: undefined,
                      });
                      onRangeChange &&
                        onRangeChange({
                          from: subMonths(new Date(), 1),
                          to: new Date(),
                        });
                    }}
                  >
                    Today
                  </Button>
                )}
            </>
          )}
        </span>
        <PopoverContent className="w-fit p-0" align="start">
          <CustomNavigation
            month={month}
            onMonthChange={setMonth}
            disabledDays={disabledDays}
          />
          <div className="w-full h-px bg-border my-2"></div>
          <div className="flex flex-col w-full items-center">
            <Calendar
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              classNames={rangeStyles}
              month={month}
              showOutsideDays={true}
              onMonthChange={setMonth}
              disabled={
                disabledDays as {
                  before: Date;
                  after: Date;
                }
              }
              className=" pb-4 -mt-16 z-[57]"
              components={{
                CaptionLabel: () => <></>,
                Chevron: () => <></>,
                Button: () => <></>,
                DropdownNav: () => <></>,
              }}
            />
          </div>
          <div className="w-full h-px bg-border mb-2"></div>
          {showQuickSelects && (
            <>
              {CustomComponent ? (
                <CustomComponent setSelectedRange={setSelectedRange} />
              ) : (
                <div className="pt-2 grid grid-cols-2 gap-4 text-[.8rem] text-muted-foreground px-4 pb-4 w-full">
                  <Button
                    onClick={() => handleQuickSelect(1)}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 24 hours
                  </Button>
                  <Button
                    onClick={() => handleQuickSelect(7)}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    onClick={() => handleQuickSelect(30)}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 30 days
                  </Button>
                  <Button
                    onClick={() => handleQuickSelect(90)}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 90 days
                  </Button>
                  <Button
                    onClick={() => handleMonthSelect(6)}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 180 days
                  </Button>
                  <Button
                    onClick={() => handleYearSelect()}
                    variant="link"
                    className="text-left h-auto p-0 justify-start font-normal underline underline-offset-[2.8px] decoration-zinc-400 text-muted-foreground"
                  >
                    Last 1 year
                  </Button>
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomDatePicker;
