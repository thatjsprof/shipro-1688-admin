"use client";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { cn } from "@/lib/utils";
import { CountryCode, E164Number } from "libphonenumber-js";

interface PhoneNumberInputProps {
  value: string;
  id: string;
  onChange: (value: E164Number) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: boolean;
  defaultCountry?: CountryCode;
  countries: CountryCode[];
  className?: string;
}

const PhoneNumberInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Enter your phone number",
  defaultCountry,
  countries,
  error,
  className,
}: PhoneNumberInputProps) => {
  return (
    <PhoneInput
      id={id}
      onBlur={onBlur}
      defaultCountry={defaultCountry}
      countries={countries.length > 0 ? countries : undefined}
      international={true}
      countryCallingCodeEditable={true}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full border-zinc-200 shadow-none hover:border-zinc-400 placeholder:text-gray-400 flex h-11 rounded-md border bg-white px-3 py-0 pr-0 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
        error && "border-destructive"
      )}
    />
  );
};

export default PhoneNumberInput;
