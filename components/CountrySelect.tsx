"use client";

import { COUNTRIES } from "@/lib/countries";

export default function CountrySelect({
  value,
  onChange,
  required = true,
  id,
  name,
  disabled,
  placeholder = "Select country",
  className = "w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed",
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const extra = value && !COUNTRIES.includes(value as (typeof COUNTRIES)[number]);

  return (
    <select
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">{placeholder}</option>
      {extra && <option value={value}>{value}</option>}
      {COUNTRIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
