import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CustomNavigationProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  disabledDays?: { before?: Date; after?: Date };
}

export const CustomNavigation: React.FC<CustomNavigationProps> = ({
  month,
  disabledDays,
  onMonthChange,
}) => {
  const today = new Date();
  const handlePrevious = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (disabledDays && disabledDays.before) {
      if (
        newMonth.getFullYear() > today.getFullYear() ||
        (newMonth.getFullYear() === today.getFullYear() &&
          newMonth.getMonth() >= today.getMonth())
      ) {
        onMonthChange(newMonth);
        return;
      }
    }
    onMonthChange(newMonth);
  };

  const handleNext = () => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    if (disabledDays && disabledDays.after) {
      if (
        newMonth.getFullYear() < today.getFullYear() ||
        (newMonth.getFullYear() === today.getFullYear() &&
          newMonth.getMonth() <= today.getMonth())
      ) {
        onMonthChange(newMonth);
        return;
      }
    }
    onMonthChange(newMonth);
  };

  const handleMonthChange = (value: string) => {
    const newMonth = new Date(month);
    newMonth.setMonth(parseInt(value, 10));
    onMonthChange(newMonth);
  };

  const handleYearChange = (value: string) => {
    const newMonth = new Date(month);
    newMonth.setFullYear(parseInt(value, 10));
    onMonthChange(newMonth);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = today.getFullYear();
  const years =
    disabledDays && disabledDays.after
      ? Array.from({ length: 101 }, (_, i) => currentYear - i)
      : Array.from({ length: 101 }, (_, i) => currentYear + i);

  console.log(
    disabledDays,
    disabledDays?.before,
    month.getMonth() === today.getMonth() &&
      month.getFullYear() === today.getFullYear()
  );

  return (
    <div className="flex items-center justify-between gap-2 py-2 pt-4 px-2 w-full relative z-[60]">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="w-[2rem] h-[2rem]"
        disabled={
          disabledDays
            ? disabledDays.before
              ? month.getMonth() === today.getMonth() &&
                month.getFullYear() === today.getFullYear()
              : false
            : false
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex gap-2 flex-1">
        <Select
          value={month.getMonth().toString()}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="flex-1 gap-2">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((name, i) => (
              <SelectItem
                key={i}
                value={i.toString()}
                disabled={
                  disabledDays
                    ? disabledDays.after
                      ? currentYear === month.getFullYear() &&
                        i > today.getMonth()
                      : currentYear === month.getFullYear() &&
                        i < today.getMonth()
                    : false
                }
              >
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={month.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="flex-1 gap-2">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="w-[2rem] h-[2rem]"
        disabled={
          disabledDays
            ? disabledDays.after
              ? month.getMonth() === today.getMonth() &&
                month.getFullYear() === today.getFullYear()
              : false
            : false
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
