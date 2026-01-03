"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  externalValue: string | string[];
  label?: string;
  labelFor?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyPlaceholder?: string;
  error?: boolean;
  inputProps?: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;
  buttonProps?: React.ComponentPropsWithoutRef<typeof Button>;
  handleInputChange?: (search: string) => void;
  handleReceiveValue: (value: string | string[]) => void;
  lowercaseVal?: boolean;
  filterFunction?: (value: string, search: string) => number;
  isModal?: boolean;
  renderProp?: (props: {
    item: T;
    value: string | string[];
  }) => React.ReactNode;
  renderBtn?: (props: { items?: T[] }) => React.ReactNode;
  commandClassname?: string;
  commandItemClassname?: string;
  commandEmptyCls?: string;
  popoverCls?: string;
  chevronCls?: string;
  commandInputCls?: string;
  commandInputWrpCls?: string;
  commandGroupClassname?: string;
  multiple?: boolean;
  maxSelections?: number;
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
  multiple = false,
  maxSelections,
  renderBtn,
  renderProp,
}: IComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | string[]>(
    multiple
      ? Array.isArray(externalValue)
        ? externalValue
        : []
      : typeof externalValue === "string"
      ? externalValue
      : ""
  );
  const [inputValue, setInputValue] = React.useState("");

  const isGrouped = items.length > 0 && "items" in items[0];
  const allItems = React.useMemo(() => {
    if (isGrouped) {
      return (items as IGroupedItems<T>[]).flatMap((group) => group.items);
    }
    return items as T[];
  }, [items, isGrouped]);

  React.useEffect(() => {
    if (multiple) {
      setValue(Array.isArray(externalValue) ? externalValue : []);
    } else {
      setValue(typeof externalValue === "string" ? externalValue : "");
    }
  }, [externalValue, multiple]);

  const selectedItems = React.useMemo(() => {
    if (!multiple) {
      const found = allItems.find(
        (item) => item.value.toLowerCase() === (value as string).toLowerCase()
      );
      return found ? [found] : [];
    }
    return allItems.filter((item) =>
      (value as string[]).some(
        (v) => v.toLowerCase() === item.value.toLowerCase()
      )
    );
  }, [value, allItems, multiple]);

  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items;

    if (isGrouped) {
      const groupedFiltered = (items as IGroupedItems<T>[])
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => filterFunction(item.label, inputValue) > 0
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

    return (items as T[]).filter((item) => {
      return filterFunction(item.label, inputValue) > 0;
    });
  }, [items, inputValue, isGrouped, filterFunction]);

  const handleSelect = (currentValue: string) => {
    const lowercased = currentValue.toLowerCase();
    const finalValue = lowercaseVal ? lowercased : currentValue;

    if (multiple) {
      const currentValues = value as string[];
      const isSelected = currentValues.some(
        (v) => v.toLowerCase() === lowercased
      );

      let newValues: string[];
      if (isSelected) {
        newValues = currentValues.filter((v) => v.toLowerCase() !== lowercased);
      } else {
        if (maxSelections && currentValues.length >= maxSelections) {
          return;
        }
        newValues = [...currentValues, finalValue];
      }

      setValue(newValues);
      handleReceiveValue(newValues);
      setInputValue("");
    } else {
      const newValue =
        (value as string).toLowerCase() === lowercased ? "" : finalValue;
      setValue(newValue);
      handleReceiveValue(newValue);
      setInputValue("");
      setOpen(false);
    }
  };

  const handleRemoveItem = (itemValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const currentValues = value as string[];
      const newValues = currentValues.filter(
        (v) => v.toLowerCase() !== itemValue.toLowerCase()
      );
      setValue(newValues);
      handleReceiveValue(newValues);
    }
  };

  const defaultRenderProp = ({
    item,
    value,
  }: {
    item: T;
    value: string | string[];
  }) => {
    const isSelected = multiple
      ? (value as string[]).some(
          (v) => v.toLowerCase() === item.value.toLowerCase()
        )
      : (value as string).toLowerCase() === item.value.toLowerCase();

    return (
      <div className="flex gap-2 items-center justify-between w-full">
        <span>{item.label}</span>
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    );
  };

  const defaultRenderBtn = ({ items }: { items?: T[] }) => {
    if (!items || items.length === 0) {
      return (
        <span className="text-gray-400 font-normal">
          {searchPlaceholder || "Select..."}
        </span>
      );
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {items.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="flex items-center gap-1 text-white"
            >
              <span className="truncate">{item.label}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => handleRemoveItem(item.value, e)}
              />
            </Badge>
          ))}
        </div>
      );
    }

    return <span className="flex items-center gap-2">{items[0]?.label}</span>;
  };

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
              onSelect={handleSelect}
            >
              {(renderProp || defaultRenderProp)({ item, value })}
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
            onSelect={handleSelect}
          >
            {(renderProp || defaultRenderProp)({ item, value })}
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
              "w-full justify-between shadow-none data-[state=open]:border-primary data-[state=open]:outline-offset-0 h-auto min-h-11 rounded-md hover:!border-zinc-400 border bg-white px-3 py-2 overflow-hidden disabled:cursor-not-allowed disabled:opacity-50",
              buttonProps?.className,
              error && "!border-destructive"
            )}
          >
            {(renderBtn || defaultRenderBtn)({
              items: selectedItems,
            })}
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
