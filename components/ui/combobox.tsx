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

export interface IItem {
  value: string;
  label: string;
}

export interface IGroupedItems<T = IItem> {
  label: string;
  items: T[];
}

export interface IComboboxProps<T = IItem> {
  items: T[] | IGroupedItems<T>[];
  externalValue: string;
  label?: string;
  labelFor?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyPlaceholder?: string;
  error?: boolean;
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;
  buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
  handleInputChange?: (search: string) => void;
  handleReceiveValue: (value: string) => void;
  lowercaseVal?: boolean;
  filterFunction?: (value: string, search: string) => number;
  isModal?: boolean;
  renderProp?: (props: { item: T; value: string }) => React.ReactNode;
  renderBtn?: (props: { item?: T }) => React.ReactNode;
  commandClassname?: string;
  commandItemClassname?: string;
  commandEmptyCls?: string;
  popoverCls?: string;
  chevronCls?: string;
  commandInputCls?: string;
  commandInputWrpCls?: string;
  commandGroupClassname?: string;
}

export function Combobox<T extends IItem = IItem>({
  items,
  handleInputChange,
  searchPlaceholder,
  emptyPlaceholder,
  inputProps,
  className,
  error,
  commandEmptyCls,
  labelFor,
  externalValue,
  commandInputCls,
  commandInputWrpCls,
  filterFunction = (value, search) => {
    if (!search) return 1;
    if (value.toLowerCase().includes(search.toLowerCase())) return 1;
    return 0;
  },
  label,
  handleReceiveValue,
  lowercaseVal = true,
  buttonProps,
  popoverCls,
  commandClassname,
  chevronCls,
  commandItemClassname,
  commandGroupClassname,
  isModal = false,
  renderBtn = ({ item }) => {
    return <span className="flex items-center gap-2">{item?.label}</span>;
  },
  renderProp = ({ item, value }) => {
    return (
      <>
        <span className="inline-block ml-[.4rem]">{item.label}</span>
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            value.toLowerCase() === item.value.toLowerCase()
              ? "opacity-100"
              : "opacity-0"
          )}
        />
      </>
    );
  },
}: IComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue);
  const [inputValue, setInputValue] = React.useState("");

  const isGrouped = items.length > 0 && "items" in items[0];
  const allItems = React.useMemo(() => {
    if (isGrouped) {
      return (items as IGroupedItems<T>[]).flatMap((group) => group.items);
    }
    return items as T[];
  }, [items, isGrouped]);

  React.useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
    else setValue("");
  }, [externalValue]);

  const found = React.useMemo(() => {
    return allItems.find(
      (item) => item.value.toLowerCase() === value.toLowerCase()
    );
  }, [value, allItems]);

  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items;

    if (isGrouped) {
      const groupedFiltered = (items as IGroupedItems<T>[])
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => filterFunction(item.value, inputValue) > 0
          ),
        }))
        .filter((group) => group.items.length > 0);

      const mergedGroups = groupedFiltered.reduce((acc, group) => {
        const existingGroup = acc.find((g) => g.label === group.label);
        if (existingGroup) {
          group.items.forEach((item) => {
            if (!existingGroup.items.find((i) => i.value === item.value)) {
              existingGroup.items.push(item);
            }
          });
        } else {
          acc.push({ ...group });
        }
        return acc;
      }, [] as IGroupedItems<T>[]);

      return mergedGroups;
    }

    return (items as T[]).filter(
      (item) => filterFunction(item.value, inputValue) > 0
    );
  }, [items, inputValue, isGrouped, filterFunction]);

  const renderItems = () => {
    if (isGrouped) {
      return (filteredItems as IGroupedItems<T>[]).map((group, index) => (
        <CommandGroup
          key={index}
          heading={group.label}
          className={cn("h-auto p-0 border-gray-200", commandGroupClassname)}
        >
          {group.items.map((item) => (
            <CommandItem
              className={cn(
                "items-center flex gap-2 cursor-pointer rounded-none",
                commandItemClassname
              )}
              key={item.value}
              value={item.value}
              onSelect={(currentValue) => {
                const lowercased = currentValue.toLowerCase();
                handleReceiveValue(lowercaseVal ? lowercased : currentValue);
                setInputValue("");
                setOpen(false);
              }}
            >
              {renderProp({ item, value })}
            </CommandItem>
          ))}
        </CommandGroup>
      ));
    }

    return (
      <CommandGroup
        className={cn("h-auto p-0 border-gray-200", commandGroupClassname)}
      >
        {(filteredItems as T[]).map((item) => (
          <CommandItem
            className={cn(
              "items-center flex gap-2 cursor-pointer rounded-none",
              commandItemClassname
            )}
            key={item.value}
            value={item.value}
            onSelect={(currentValue) => {
              const lowercased = currentValue.toLowerCase();
              handleReceiveValue(lowercaseVal ? lowercased : currentValue);
              setInputValue("");
              setOpen(false);
            }}
          >
            {renderProp({ item, value })}
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

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
              "w-full justify-between shadow-none data-[state=open]:border-primary data-[state=open]:outline-offset-0 h-11 rounded-md hover:!border-zinc-400 border bg-white px-3 py-1 overflow-hidden disabled:cursor-not-allowed disabled:opacity-50",
              buttonProps?.className,
              error && "!border-destructive"
            )}
          >
            {value ? (
              renderBtn({
                item: found,
              })
            ) : searchPlaceholder ? (
              <span className="text-gray-400 font-normal">
                {searchPlaceholder}
              </span>
            ) : (
              "Select..."
            )}
            <ChevronsUpDown
              className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", chevronCls)}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 popover-content-width-full border-gray-200 z-[300]",
            popoverCls
          )}
          align="start"
        >
          <Command
            shouldFilter={false}
            className={cn("border-gray-200", commandClassname)}
          >
            <CommandInput
              wrapperCls={cn("border-gray-200", commandInputWrpCls)}
              className={cn("placeholder:text-gray-400", commandInputCls)}
              placeholder={searchPlaceholder ? searchPlaceholder : "Search..."}
              value={inputValue}
              onValueChange={(val) => {
                setInputValue(val);
                handleInputChange && handleInputChange(val);
              }}
              {...inputProps}
            />
            <CommandEmpty className={commandEmptyCls}>
              {emptyPlaceholder ? emptyPlaceholder : "No value found."}
            </CommandEmpty>
            <ScrollArea className="h-[14rem] w-full" type="always">
              {renderItems()}
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
