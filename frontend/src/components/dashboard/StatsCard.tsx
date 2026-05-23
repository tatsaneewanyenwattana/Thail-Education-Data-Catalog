type StatsCardProps = {
  label: string;
  value: string;
  footer?: string;
  valueClassName?: string;
};

export default function StatsCard({
  label,
  value,
  footer,
  valueClassName = "text-text-primary",
}: StatsCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 transition-transform hover:-translate-y-1 md:p-6">
      <span className="font-sarabun text-label text-text-muted">{label}</span>
      <span className={`font-kanit text-4xl font-bold leading-tight ${valueClassName}`}>
        {value}
      </span>
      {footer ? (
        <p className="mt-1 flex items-center gap-1 font-sarabun text-caption text-text-muted">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
