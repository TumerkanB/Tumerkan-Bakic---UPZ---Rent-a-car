import { Activity, Building2, Car, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { fetchBranches, fetchCars } from '../fleet/fleetApi';

interface HealthStatus {
  status: string;
  database: { ok: boolean; latencyMs?: number };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [carCount, setCarCount] = useState<number | null>(null);
  const [branchCount, setBranchCount] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<HealthStatus>('/health')
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', database: { ok: false } }));

    fetchCars({ page: 1, pageSize: 1 })
      .then((res) => setCarCount(res.pagination.total))
      .catch(() => setCarCount(null));

    fetchBranches()
      .then((res) => setBranchCount(res.items.length))
      .catch(() => setBranchCount(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.username}</h1>
        <p className="text-sm text-slate-500">RentACar operations overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">API &amp; Database</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {health ? (health.database.ok ? 'Connected' : 'Degraded') : 'Checking...'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {health?.database.latencyMs !== undefined ? `${health.database.latencyMs} ms latency` : 'MySQL 8'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Vehicles</span>
            <Car className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{carCount ?? '—'}</div>
          <div className="mt-1 text-xs text-slate-500">Registered in fleet</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Branches</span>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{branchCount ?? '—'}</div>
          <div className="mt-1 text-xs text-slate-500">Configured locations</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Role &amp; Access</span>
            <ShieldCheck className="h-4 w-4 text-violet-600" />
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{user?.roleName}</div>
          <div className="mt-1 text-xs text-slate-500">{user?.permissions.length ?? 0} permissions</div>
        </div>
      </div>
    </div>
  );
}
