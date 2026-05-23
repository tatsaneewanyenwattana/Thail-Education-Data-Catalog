type StatItem = {
  label: string;
  value: string;
};

type StatsOverviewProps = {
  stats: StatItem[];
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-radius-md border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6"
        >
          <p className="font-kanit text-display text-primary-dark md:text-[40px] md:leading-[48px]">
            {stat.value}
          </p>
          <p className="mt-1 font-sarabun text-label text-text-secondary">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
