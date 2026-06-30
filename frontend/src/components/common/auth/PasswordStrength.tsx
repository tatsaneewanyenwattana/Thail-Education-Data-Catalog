type PasswordChecks = {
  length: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
}

export function getPasswordLevel(checks: PasswordChecks): number {
  return Object.values(checks).filter(Boolean).length;
}

export default function PasswordStrengthIndicator({
  password,
  labels,
}: {
  password: string;
  labels: {
    length: string;
    lower: string;
    upper: string;
    number: string;
    special: string;
  };
}) {
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const level = getPasswordLevel(checks);

  const checklist = [
    { label: labels.length, met: checks.length },
    { label: labels.lower, met: checks.lower },
    { label: labels.upper, met: checks.upper },
    { label: labels.number, met: checks.number },
    { label: labels.special, met: checks.special },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              index < level ? "bg-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checklist.map((item) => (
          <li
            key={item.label}
            className={`font-sarabun text-caption ${
              item.met ? "text-primary" : "text-text-muted"
            }`}
          >
            {item.met ? "✓" : "✗"} {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
