import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { fetchConditionReports } from './reservationsApi';

export function ConditionReportsPage() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchConditionReports>>['data']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchConditionReports(q || undefined)
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Condition Reports</h1>
        <p className="text-sm text-slate-500">Immutable pick-up and return vehicle inspection records.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by plate or reservation #..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No condition reports found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Reservation</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Mileage / Fuel</th>
                <th className="px-4 py-3">Clean</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.conditionID}>
                  <td className="px-4 py-2.5">
                    <Link to={`/reservations/${r.reservationID}`} className="font-mono text-xs text-blue-600 hover:underline">
                      #{r.reservationID}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={r.stage === 'Pickup' ? 'Active' : 'Completed'} />
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <div className="font-medium text-slate-900">
                      {r.brandName} {r.modelName}
                    </div>
                    <div className="font-mono text-slate-500">{r.plate}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {r.mileage.toLocaleString()} km · {r.fuelPercent}%
                  </td>
                  <td className="px-4 py-2.5 text-xs">{r.isClean === 1 ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2.5 text-xs">{r.photoCount}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {new Date(r.recordedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
