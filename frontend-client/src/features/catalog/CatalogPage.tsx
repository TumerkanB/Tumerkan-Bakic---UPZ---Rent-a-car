import { Car, Fuel, MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchPublicBranches,
  fetchPublicCars,
  fetchPublicCategories,
  type PublicBranchItem,
  type PublicCarItem,
  type PublicCategoryItem,
} from './catalogApi';

export function CatalogPage() {
  const [cars, setCars] = useState<PublicCarItem[]>([]);
  const [branches, setBranches] = useState<PublicBranchItem[]>([]);
  const [categories, setCategories] = useState<PublicCategoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [branchID, setBranchID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPublicBranches(), fetchPublicCategories()])
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

    fetchPublicCars({
      search: search || undefined,
      branchID: branchID ? Number(branchID) : undefined,
      categoryID: categoryID ? Number(categoryID) : undefined,
    })
      .then((res) => {
        if (active) setCars(res.items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load available vehicles');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, branchID, categoryID]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <h1 className="text-3xl font-semibold tracking-tight">Find the right car for your trip</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Browse available vehicles across branches, compare daily rates, and sign in to book.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand or model..."
            className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={branchID}
          onChange={(e) => setBranchID(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All pickup branches</option>
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

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading available vehicles...</div>
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Car className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No available vehicles match your filters</p>
          <p className="text-xs text-slate-500">Try clearing filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div
              key={car.carID}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {car.categoryName}
                    </span>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {car.brandName} {car.modelName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">
                      {car.dailyRate !== null ? `€${car.dailyRate.toFixed(2)}` : '—'}
                    </div>
                    <div className="text-xs text-slate-500">per day</div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {car.fuelType}
                      {car.color ? ` · ${car.color}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{car.branchName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
