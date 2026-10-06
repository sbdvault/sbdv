"use client";

import { COUNTRIES } from "@/lib/countries";

export default function CountrySelect({
  value,
  onChange,
  required = true,
  id,
  className = "w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body bg-white",
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const extra = value && !COUNTRIES.includes(value as (typeof COUNTRIES)[number]);

  return (
    <select
      id={id}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">Select country</option>
      {extra && <option value={value}>{value}</option>}
      {COUNTRIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
