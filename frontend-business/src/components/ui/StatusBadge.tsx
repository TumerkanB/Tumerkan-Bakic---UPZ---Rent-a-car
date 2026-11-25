const STYLES: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Active: 'bg-blue-50 text-blue-700 border-blue-200',
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Maintenance: 'bg-amber-50 text-amber-800 border-amber-200',
  Partial: 'bg-amber-50 text-amber-800 border-amber-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  Voided: 'bg-slate-100 text-slate-600 border-slate-200',
  Overdue: 'bg-red-50 text-red-700 border-red-200',
  Unpaid: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  );
}
