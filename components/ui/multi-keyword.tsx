import * as React from "react";
import { X, Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const MultiKeywordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    keywords?: string[];
    onKeywordsChange?: (keywords: string[]) => void;
    multiKeywordMode?: boolean;
    isSearched?: boolean;
    onModeToggle?: () => void;
  }
>(
  (
    {
      className,
      keywords = [],
      onKeywordsChange,
      multiKeywordMode = false,
      onModeToggle,
      isSearched,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const currentValue = multiKeywordMode
      ? internalValue
      : (value as string) || "";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (multiKeywordMode && (e.key === "Enter" || e.key === ",")) {
        e.preventDefault();
        const trimmed = internalValue.trim();
        if (trimmed && !keywords.includes(trimmed)) {
          onKeywordsChange?.([...keywords, trimmed]);
          setInternalValue("");
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (multiKeywordMode) {
        setInternalValue(e.target.value);
      } else {
        onChange?.(e);
      }
    };

    const handleClearSearch = () => {
      setInternalValue("");
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    const removeKeyword = (keyword: string) => {
      onKeywordsChange?.(keywords.filter((k) => k !== keyword));
    };

    return (
      <div className="w-full">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-11 pl-[3rem] !text-[1rem] placeholder:text-[.95rem]",
              className
            )}
            StartIcon={<Search className="ml-2 text-gray-400 h-4 w-4" />}
            EndIcon={
              currentValue || keywords.length > 0 ? (
                <X
                  className="text-gray-400 -mr-[.1rem] h-4 w-4 cursor-pointer"
                  onClick={handleClearSearch}
                />
              ) : null
            }
            {...props}
          />
        </div>
        {multiKeywordMode && keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
              >
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-full p-0.5"
                  onClick={() => removeKeyword(keyword)}
                />
              </span>
            ))}
          </div>
        )}
        {multiKeywordMode && (
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to add keywords • {keywords.length} keyword
            {keywords.length !== 1 ? "s" : ""} added{" "}
            {!isSearched && (
              <span className="text-destructive">(not applied)</span>
            )}
          </p>
        )}
      </div>
    );
  }
);
MultiKeywordInput.displayName = "MultiKeywordInput";
export default MultiKeywordInput;
