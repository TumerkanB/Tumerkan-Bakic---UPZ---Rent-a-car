import { AlertTriangle, Car, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchBranches,
  fetchCars,
  fetchCategories,
  type BranchItem,
  type CarItem,
  type CategoryItem,
} from './fleetApi';

const STATUS_STYLES: Record<CarItem['status'], string> = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function FleetPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [branchID, setBranchID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchBranches(), fetchCategories()])
      .then(([b, c]) => {
        setBranches(b.items);
        setCategories(c.items);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchCars({
      search: search || undefined,
      status: status || undefined,
      branchID: branchID ? Number(branchID) : undefined,
      categoryID: categoryID ? Number(categoryID) : undefined,
    })
      .then((res) => {
        if (active) setCars(res.items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load fleet');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, branchID, categoryID]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Fleet</h1>
          <p className="text-sm text-slate-500">Vehicles, branches, daily rates, and compliance status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate, brand, model..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="Available">Available</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={branchID}
          onChange={(e) => setBranchID(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.branchID} value={b.branchID}>
              {b.branchName} ({b.cityName})
            </option>
          ))}
        </select>

        <select
          value={categoryID}
          onChange={(e) => setCategoryID(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading vehicles...</div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <Car className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No vehicles found</p>
            <p className="text-xs text-slate-500">Add branches and cars in the database or adjust filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Plate</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-4 py-3">Daily Rate</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.map((car) => (
                  <tr key={car.carID} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {car.brandName} {car.modelName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {car.fuelType}
                        {car.color ? ` · ${car.color}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{car.plate}</td>
                    <td className="px-4 py-3 text-slate-700">{car.categoryName}</td>
                    <td className="px-4 py-3 text-slate-700">{car.branchName}</td>
                    <td className="px-4 py-3 text-slate-700">{car.currentMileage.toLocaleString()} km</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {car.dailyRate !== null ? `€${car.dailyRate.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[car.status]}`}
                        >
                          {car.status}
                        </span>
                        {car.issues && (
                          <span title={car.issues} className="text-amber-500">
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
