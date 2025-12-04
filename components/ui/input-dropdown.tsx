import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ComboItem {
  label: string;
  value: string | number;
}

interface InputDropdownProps {
  items: ComboItem[];
  onChange?: (item: ComboItem) => void;
  placeholder?: string;
  error?: boolean;
  type?: "textarea" | "input";
  initialValue?: string;
  className?: string;
}

const InputDropdown: React.FC<InputDropdownProps> = ({
  error,
  type = "input",
  items = [],
  onChange = () => {},
  placeholder = "Type or select...",
  initialValue = "",
  className,
}) => {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ComboItem | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const emit = (label: string, selected: ComboItem | null) => {
    if (selected) {
      onChange(selected);
    } else {
      onChange({ label, value: label });
    }
  };

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);
    setSelectedItem(null);
    emit(value, null);
  };

  const handleSelectItem = (item: ComboItem) => {
    setInputValue(item.label);
    setSelectedItem(item);
    setIsOpen(false);
    emit(item.label, item);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full">
        {type === "input" ? (
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={cn("pr-10", className)}
            error={error}
          />
        ) : (
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            rows={2}
            error={error}
            className={cn(className)}
          />
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60">
          <ScrollArea className="h-60">
            {filteredItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm">{item.label}</span>
                {selectedItem?.value === item.value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </ScrollArea>
        </div>
      )}
      {isOpen && filteredItems.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg p-3 text-sm text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
};

export default InputDropdown;
