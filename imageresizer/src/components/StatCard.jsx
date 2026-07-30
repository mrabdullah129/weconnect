export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-500/12 text-teal-600 dark:text-teal-300">
            <Icon size={22} />
          </span>
        )}
      </div>
    </div>
  );
}
