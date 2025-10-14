"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Command as CommandPrimitive } from "cmdk";
import { ScrollArea } from "./scroll-area";

interface ICombobox {
  items: {
    value: string;
    label: string;
  }[];
  externalValue: string;
  label?: string;
  labelFor?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyPlaceholder?: string;
  error?: boolean;
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;
  buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
  handleInputChange?: ((search: string) => void) | undefined;
  handleReceiveValue: (value: string) => void;
  lowercaseVal?: boolean;
  filterFunction?: (value: string, search: string) => number;
  isModal?: boolean;
}

export function Combobox({
  items,
  handleInputChange,
  searchPlaceholder,
  emptyPlaceholder,
  inputProps,
  className,
  error,
  labelFor,
  externalValue,
  filterFunction,
  label,
  handleReceiveValue,
  lowercaseVal = true,
  buttonProps,
  isModal = false,
}: ICombobox) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue);
  const [inputValue, setInputValue] = React.useState("");

  const itemsToRender = React.useMemo(() => {
    return items;
  }, [items]);

  React.useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
    else setValue("");
  }, [externalValue]);

  return (
    <div className={cn(`${label ? "space-y-2" : ""}`, className)}>
      {label && (
        <Label
          htmlFor={labelFor}
          className={`text-sm font-medium leading-none ${
            error ? "text-destructive" : ""
          }`}
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={isModal}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            {...buttonProps}
            className={cn(
              "w-full justify-between shadow-none data-[state=open]:border-primary data-[state=open]:outline-offset-0 h-11 rounded-md hover:border-zinc-400 border bg-white px-3 py-1 overflow-hidden hover:bg-transparent",
              error && "border-destructive",
              buttonProps?.className
            )}
          >
            {value ? (
              itemsToRender.find(
                (item) => item.value.toLowerCase() === value.toLowerCase()
              )?.label
            ) : searchPlaceholder ? (
              <span className="text-gray-400 font-normal">
                {searchPlaceholder}
              </span>
            ) : (
              "Select..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 popover-content-width-full"
          align="start"
        >
          <Command filter={filterFunction}>
            <CommandInput
              placeholder={searchPlaceholder ? searchPlaceholder : "Search..."}
              value={inputValue}
              onValueChange={(val) => {
                setInputValue(val);
                handleInputChange && handleInputChange(val);
              }}
              {...inputProps}
            />
            <CommandEmpty>
              {emptyPlaceholder ? emptyPlaceholder : "No value found."}
            </CommandEmpty>
            <CommandGroup className="h-auto">
              <ScrollArea className="h-[14rem] w-full">
                {itemsToRender.map((item) => (
                  <CommandItem
                    className="items-center flex gap-2"
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      const uppercased = currentValue.toLowerCase();
                      handleReceiveValue(
                        lowercaseVal ? uppercased : currentValue
                      );
                      setInputValue("");
                      setOpen(false);
                    }}
                  >
                    <span className="inline-block ml-[.4rem]">
                      {item.label}
                    </span>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value.toLowerCase()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {/* {error && <FormMessage className="mt-2">{error}</FormMessage>} */}
    </div>
  );
}
