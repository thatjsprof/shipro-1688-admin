import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type MultiSelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type MultiSelectProps<T extends string | number> = {
  options: MultiSelectOption<T>[];
  selected: MultiSelectOption<T>[];
  onChange: (values: MultiSelectOption<T>[]) => void;
  placeholder?: string;
  className?: string;
  label?: React.ReactNode;
  align?: "end" | "center" | "start";
  renderButton?: (selected: MultiSelectOption<T>[]) => React.ReactNode;
};

export function MultiSelect<T extends string | number>({
  align,
  options,
  selected,
  className,
  onChange,
  label = (
    <>
      <Info className="size-4" />
      <span>Status</span>
    </>
  ),
  renderButton = (selected) => (
    <span className="rounded-full bg-destructive min-h-5 min-w-5 text-white text-xs px-1 flex items-center justify-center">
      {selected.length}
    </span>
  ),
}: MultiSelectProps<T>) {
  const toggleOption = (option: MultiSelectOption<T>) => {
    const isSelected = selected.some((o) => o.value === option.value);
    onChange(
      isSelected
        ? selected.filter((o) => o.value !== option.value)
        : [...selected, option]
    );
  };

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 w-fit shadow-none justify-between cursor-pointer hover:border-zinc-400 !bg-transparent !text-[1rem] data-[state=open]:border-primary",
            className
          )}
        >
          <p className="flex items-center gap-2 mr-3">
            {label}
            {selected.length > 0 && renderButton && renderButton(selected)}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="p-2 w-fit"
        align={align}
      >
        {options.map((option) => (
          <div
            key={String(option.value)}
            className="flex items-center gap-2 px-2 py-1 cursor-pointer"
            onClick={() => toggleOption(option)}
          >
            <Checkbox
              className="cursor-pointer"
              checked={selected.some((s) => s.value === option.value)}
            />
            <span className="text-sm">{option.label}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
