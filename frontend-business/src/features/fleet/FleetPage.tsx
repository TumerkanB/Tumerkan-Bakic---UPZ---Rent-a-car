import { AlertTriangle, Car, Eye, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import {
  deleteCar,
  fetchBranches,
  fetchCars,
  fetchCatalogData,
  fetchCategories,
  type BranchItem,
  type BrandItem,
  type CarItem,
  type CategoryItem,
} from './fleetApi';

export function FleetPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [cars, setCars] = useState<CarItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('carID');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [branchID, setBranchID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [brandID, setBrandID] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [expiringSoon, setExpiringSoon] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarItem | null>(null);

  useEffect(() => {
    Promise.all([fetchBranches(), fetchCategories(), fetchCatalogData()])
      .then(([b, c, cat]) => {
        setBranches(b.items);
        setCategories(c.items);
        setBrands(cat.brands);
      })
      .catch(() => undefined);
  }, []);

  const loadCars = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCars({
      page,
      pageSize: 20,
      sort,
      order,
      search: search || undefined,
      status: status || undefined,
      branchID: branchID ? Number(branchID) : undefined,
      categoryID: categoryID ? Number(categoryID) : undefined,
      brandID: brandID ? Number(brandID) : undefined,
      fuelType: fuelType || undefined,
      transmission: transmission || undefined,
      expiringSoon,
    })
      .then((res) => {
        setCars(res.items);
        setTotal(res.pagination.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load fleet'))
      .finally(() => setLoading(false));
  }, [page, sort, order, search, status, branchID, categoryID, brandID, fuelType, transmission, expiringSoon]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCar(deleteTarget.carID);
      showSuccess(`Car ${deleteTarget.plate} deleted`);
      setDeleteTarget(null);
      loadCars();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Cannot delete car');
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<CarItem>[] = [
    {
      key: 'brandName',
      header: 'Vehicle',
      sortable: true,
      render: (car) => (
        <div className="flex items-center gap-3">
          {car.thumbnail ? (
            <img src={car.thumbnail} alt={car.modelName} className="h-10 w-14 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-slate-400">
              <Car className="h-4 w-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              {(car.manufacturerLogo || car.brandLogo) && (
                <img
                  src={(car.manufacturerLogo || car.brandLogo)!}
                  alt={car.brandName}
                  className="h-4 w-4 object-contain"
                />
              )}
              <span>
                {car.brandName} {car.modelName}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {car.transmission} · {car.fuelType}
            </div>
          </div>
        </div>
      ),
      csvValue: (c) => `${c.brandName} ${c.modelName}`,
    },
    {
      key: 'plate',
      header: 'Plate',
      sortable: true,
      render: (c) => <span className="font-mono text-xs text-slate-700">{c.plate}</span>,
      csvValue: (c) => c.plate,
    },
    {
      key: 'categoryName',
      header: 'Category',
      sortable: true,
      render: (c) => <span className="text-slate-700">{c.categoryName}</span>,
      csvValue: (c) => c.categoryName,
    },
    {
      key: 'branchName',
      header: 'Branch',
      sortable: true,
      render: (c) => <span className="text-slate-700">{c.branchName}</span>,
      csvValue: (c) => c.branchName,
    },
    {
      key: 'currentMileage',
      header: 'Mileage',
      sortable: true,
      render: (c) => <span className="text-slate-700">{c.currentMileage.toLocaleString()} km</span>,
      csvValue: (c) => c.currentMileage,
    },
    {
      key: 'dailyRate',
      header: 'Daily Rate',
      sortable: true,
      render: (c) => (
        <span className="font-medium text-slate-900">
          {c.dailyRate !== null ? `€${c.dailyRate.toFixed(2)}` : '—'}
        </span>
      ),
      csvValue: (c) => c.dailyRate,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={c.status} />
          {c.issues && (
            <span title={c.issues} className="text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}
        </div>
      ),
      csvValue: (c) => c.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/cars/${c.carID}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" />
            Manage
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(c)}
            title="Delete car (only if unused and has no images)"
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Cars</h1>
          <p className="text-sm text-slate-500">Vehicles, gallery, pricing, compliance, and maintenance.</p>
        </div>
        <Link
          to={ROUTES.CARS_REGISTER}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Register new car
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={cars}
        rowKey={(c) => c.carID}
        loading={loading}
        error={error}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
        sort={sort}
        order={order}
        onSortChange={(k) => {
          if (sort === k) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
          else {
            setSort(k);
            setOrder('asc');
          }
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search plate, brand, model..."
        exportFilename="fleet.csv"
        filters={
          <>
            {user?.branchID === null && (
              <select
                value={branchID}
                onChange={(e) => {
                  setBranchID(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.branchID} value={b.branchID}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            )}
            <select
              value={categoryID}
              onChange={(e) => {
                setCategoryID(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            <select
              value={brandID}
              onChange={(e) => {
                setBrandID(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.brandID} value={b.brandID}>
                  {b.brandName}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All statuses</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={fuelType}
              onChange={(e) => {
                setFuelType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All fuel</option>
              <option value="Gas">Gas</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select
              value={transmission}
              onChange={(e) => {
                setTransmission(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All transmissions</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={expiringSoon}
                onChange={(e) => {
                  setExpiringSoon(e.target.checked);
                  setPage(1);
                }}
              />
              Expiring in 30d
            </label>
          </>
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete car"
        message={`Delete "${deleteTarget?.plate}"? A car with images or reservations cannot be deleted; delete its images first or set status to Inactive.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
