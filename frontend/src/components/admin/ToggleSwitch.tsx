"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-radius-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark/20 disabled:opacity-50 ${
        checked ? "bg-primary-container" : "bg-border-default"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-radius-full bg-surface-card transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
