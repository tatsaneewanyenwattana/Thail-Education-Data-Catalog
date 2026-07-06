"use client";

import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

type AdminDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  id?: string;
  placeholder?: string;
};

function toDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toIso(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminDatePicker({
  value,
  onChange,
  locale = "th",
  id,
  placeholder = "วว/ดด/ปปปป",
}: AdminDatePickerProps) {
  return (
    <DatePicker
      id={id}
      selected={toDate(value)}
      onChange={(date) => onChange(toIso(date))}
      locale={locale === "th" ? "th" : undefined}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      isClearable
      showPopperArrow={false}
      popperClassName="admin-datepicker-popper"
      className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-[#0081A7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0081A7]/20"
      calendarClassName="admin-datepicker-calendar"
    />
  );
}
