import { AlertTriangle, Car, Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import {
  addCarImage,
  deleteCarImage,
  fetchBranches,
  fetchCarById,
  fetchCars,
  fetchCategories,
  setPrimaryCarImage,
  updateCar,
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

  // Edit modal state
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    Promise.all([fetchBranches(), fetchCategories()])
      .then(([b, c]) => {
        setBranches(b.items);
        setCategories(c.items);
      })
      .catch(() => undefined);
  }, []);

  function loadCars() {
    setLoading(true);
    setError(null);
    fetchCars({
      search: search || undefined,
      status: status || undefined,
      branchID: branchID ? Number(branchID) : undefined,
      categoryID: categoryID ? Number(categoryID) : undefined,
    })
      .then((res) => setCars(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load fleet'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCars();
  }, [search, status, branchID, categoryID]);

  async function openEdit(carID: number) {
    setEditError(null);
    setNewImageUrl('');
    try {
      const res = await fetchCarById(carID);
      setEditingCar(res.car);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load car details');
    }
  }

  async function handleSaveCar(e: FormEvent) {
    e.preventDefault();
    if (!editingCar) return;
    setEditError(null);
    setSavingEdit(true);
    try {
      await updateCar(editingCar.carID, {
        categoryID: editingCar.categoryID,
        branchID: editingCar.branchID,
        plate: editingCar.plate,
        color: editingCar.color,
        fuelType: editingCar.fuelType,
        transmission: editingCar.transmission,
        status: editingCar.status,
        currentMileage: editingCar.currentMileage,
        insuranceExpiry: editingCar.insuranceExpiry,
        registrationExpiry: editingCar.registrationExpiry,
        inspectionExpiry: editingCar.inspectionExpiry,
        nextServiceDate: editingCar.nextServiceDate,
        nextServiceMileage: editingCar.nextServiceMileage,
      });
      setEditingCar(null);
      loadCars();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update car');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleAddImage() {
    if (!editingCar || !newImageUrl.trim()) return;
    setEditError(null);
    try {
      const res = await addCarImage(editingCar.carID, newImageUrl.trim(), null, false);
      setEditingCar(res.car);
      setNewImageUrl('');
      loadCars();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to add image');
    }
  }

  async function handleSetPrimary(imageID: number) {
    if (!editingCar) return;
    setEditError(null);
    try {
      const res = await setPrimaryCarImage(editingCar.carID, imageID);
      setEditingCar(res.car);
      loadCars();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to update primary image');
    }
  }

  async function handleDeleteImage(imageID: number) {
    if (!editingCar) return;
    setEditError(null);
    try {
      const res = await deleteCarImage(editingCar.carID, imageID);
      setEditingCar(res.car);
      loadCars();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Failed to delete image');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Cars</h1>
          <p className="text-sm text-slate-500">Vehicles, branches, daily rates, images, and compliance status.</p>
        </div>

        <Link
          to={ROUTES.CARS_REGISTER}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Register new car
        </Link>
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
            <p className="text-xs text-slate-500">Register a new car or adjust your filters.</p>
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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.map((car) => (
                  <tr key={car.carID} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {car.thumbnail ? (
                          <img
                            src={car.thumbnail}
                            alt={car.modelName}
                            className="h-10 w-14 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-slate-400">
                            <Car className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {car.brandName} {car.modelName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {car.transmission} · {car.fuelType}
                            {car.color ? ` · ${car.color}` : ''}
                          </div>
                        </div>
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
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(car.carID)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Car Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit {editingCar.brandName} {editingCar.modelName} ({editingCar.plate})
              </h2>
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveCar} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Plate</label>
                  <input
                    type="text"
                    required
                    value={editingCar.plate}
                    onChange={(e) => setEditingCar({ ...editingCar, plate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
                  <select
                    value={editingCar.status}
                    onChange={(e) =>
                      setEditingCar({ ...editingCar, status: e.target.value as CarItem['status'] })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Branch</label>
                  <select
                    value={editingCar.branchID}
                    onChange={(e) => setEditingCar({ ...editingCar, branchID: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {branches.map((b) => (
                      <option key={b.branchID} value={b.branchID}>
                        {b.branchName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Category</label>
                  <select
                    value={editingCar.categoryID}
                    onChange={(e) => setEditingCar({ ...editingCar, categoryID: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.categoryID} value={c.categoryID}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Fuel type</label>
                  <select
                    value={editingCar.fuelType}
                    onChange={(e) =>
                      setEditingCar({ ...editingCar, fuelType: e.target.value as CarItem['fuelType'] })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="Gas">Gas</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Transmission</label>
                  <select
                    value={editingCar.transmission}
                    onChange={(e) =>
                      setEditingCar({
                        ...editingCar,
                        transmission: e.target.value as CarItem['transmission'],
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Mileage (km)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingCar.currentMileage}
                    onChange={(e) =>
                      setEditingCar({ ...editingCar, currentMileage: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Color</label>
                  <input
                    type="text"
                    value={editingCar.color ?? ''}
                    onChange={(e) => setEditingCar({ ...editingCar, color: e.target.value || null })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Car Images */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Images</h3>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add image URL or path..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Add image
                  </button>
                </div>

                {editingCar.images && editingCar.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {editingCar.images.map((img) => (
                      <div key={img.imageID} className="overflow-hidden rounded-lg border border-slate-200">
                        <img src={img.fileReference} alt="" className="h-24 w-full object-cover" />
                        <div className="flex items-center justify-between bg-slate-50 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img.imageID)}
                            className={`inline-flex items-center gap-1 text-xs ${
                              img.isPrimary === 1 ? 'font-semibold text-blue-600' : 'text-slate-500'
                            }`}
                          >
                            <Star className="h-3 w-3" />
                            {img.isPrimary === 1 ? 'Main' : 'Set main'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.imageID)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
