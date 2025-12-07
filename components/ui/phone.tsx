"use client";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { cn } from "@/lib/utils";
import { CountryCode, E164Number } from "libphonenumber-js";
import { useState } from "react";

interface PhoneNumberInputProps {
  value: string;
  id: string;
  onChange: (value: E164Number) => void;
  onBlur: () => void;
  placeholder?: string;
  country?: CountryCode;
  error?: boolean;
  className?: string;
}

const PhoneNumberInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Enter your phone number",
  country,
  error,
  EndIcon,
  className,
}: PhoneNumberInputProps & { EndIcon?: React.ReactNode }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full">
      <PhoneInput
        id={id}
        onBlur={() => {
          onBlur();
          setFocused(false);
        }}
        onFocus={() => setFocused(true)}
        defaultCountry={country}
        countries={country ? [country] : undefined}
        international={true}
        countryCallingCodeEditable={false}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full border-zinc-200 shadow-none hover:border-zinc-400 placeholder:text-gray-400 flex h-10 rounded-md border bg-white px-3 py-0 pr-0 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          focused && "!border-primary",
          error && "!border-destructive",
          className
        )}
      />
      {EndIcon && (
        <div className="absolute top-1/2 right-[.5rem] transform -translate-x-1/2 -translate-y-1/2">
          {EndIcon}
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;
