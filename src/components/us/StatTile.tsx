export default function StatTile({
  value,
  label,
  colorClass,
}: {
  value: string | number;
  label: string;
  colorClass: string;
}) {
  return (
    <div className={`rounded-2xl p-4 text-center ${colorClass}`}>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-[10.5px] font-semibold text-ink/70">{label}</p>
    </div>
  );
}
