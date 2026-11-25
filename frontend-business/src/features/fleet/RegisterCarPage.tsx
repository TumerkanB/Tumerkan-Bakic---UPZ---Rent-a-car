import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import {
  createCar,
  fetchBranches,
  fetchCatalogData,
  fetchCategories,
  type BranchItem,
  type CatalogDataResponse,
  type CategoryItem,
} from './fleetApi';

export function RegisterCarPage() {
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState<CatalogDataResponse | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const [brandID, setBrandID] = useState('');
  const [modelID, setModelID] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [branchID, setBranchID] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState<'Gas' | 'Diesel' | 'Electric' | 'Hybrid'>('Gas');
  const [transmission, setTransmission] = useState<'Manual' | 'Automatic'>('Manual');
  const [status, setStatus] = useState<'Available' | 'Maintenance' | 'Inactive'>('Available');
  const [currentMileage, setCurrentMileage] = useState('0');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [registrationExpiry, setRegistrationExpiry] = useState('');
  const [inspectionExpiry, setInspectionExpiry] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [nextServiceMileage, setNextServiceMileage] = useState('');
  const [initialImageUrl, setInitialImageUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchCatalogData(), fetchBranches(), fetchCategories()])
      .then(([catData, brRes, catRes]) => {
        setCatalog(catData);
        setBranches(brRes.items.filter((b) => b.isActive === 1));
        setCategories(catRes.items);
      })
      .catch(() => setError('Failed to load form options'));
  }, []);

  const filteredModels = useMemo(() => {
    if (!catalog) return [];
    if (!brandID) return catalog.models;
    return catalog.models.filter((m) => m.brandID === Number(brandID));
  }, [catalog, brandID]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createCar({
        modelID: Number(modelID),
        categoryID: Number(categoryID),
        branchID: Number(branchID),
        plate: plate.trim(),
        color: color.trim() || null,
        fuelType,
        transmission,
        status,
        currentMileage: Number(currentMileage),
        insuranceExpiry: insuranceExpiry || null,
        registrationExpiry: registrationExpiry || null,
        inspectionExpiry: inspectionExpiry || null,
        nextServiceDate: nextServiceDate || null,
        nextServiceMileage: nextServiceMileage ? Number(nextServiceMileage) : null,
        initialImageUrl: initialImageUrl.trim() || null,
      });
      navigate(ROUTES.CARS_MANAGE);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to register car');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Register New Car</h1>
        <p className="text-sm text-slate-500">Add a vehicle to the fleet with specs and compliance dates.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Brand</label>
            <select
              required
              value={brandID}
              onChange={(e) => {
                setBrandID(e.target.value);
                setModelID('');
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select brand</option>
              {catalog?.brands.map((b) => (
                <option key={b.brandID} value={b.brandID}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Model</label>
            <select
              required
              value={modelID}
              onChange={(e) => setModelID(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select model</option>
              {filteredModels.map((m) => (
                <option key={m.modelID} value={m.modelID}>
                  {m.modelName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Category</label>
            <select
              required
              value={categoryID}
              onChange={(e) => setCategoryID(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Branch</label>
            <select
              required
              value={branchID}
              onChange={(e) => setBranchID(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.branchID} value={b.branchID}>
                  {b.branchName} ({b.cityName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Plate number</label>
            <input
              type="text"
              required
              maxLength={20}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Color</label>
            <input
              type="text"
              maxLength={50}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Fuel type</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as typeof fuelType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Gas">Gas</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Transmission</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value as typeof transmission)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Current mileage (km)</label>
            <input
              type="number"
              min={0}
              required
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <fieldset className="space-y-4 border-t border-slate-100 pt-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Compliance &amp; Service (optional)
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Insurance expiry</label>
              <input
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Registration expiry</label>
              <input
                type="date"
                value={registrationExpiry}
                onChange={(e) => setRegistrationExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Inspection expiry</label>
              <input
                type="date"
                value={inspectionExpiry}
                onChange={(e) => setInspectionExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Next service date</label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Next service mileage</label>
              <input
                type="number"
                min={0}
                value={nextServiceMileage}
                onChange={(e) => setNextServiceMileage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </fieldset>

        <div className="border-t border-slate-100 pt-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            Primary photo URL or path (optional)
          </label>
          <input
            type="text"
            maxLength={500}
            value={initialImageUrl}
            onChange={(e) => setInitialImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CARS_MANAGE)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Registering...' : 'Register car'}
          </button>
        </div>
      </form>
    </div>
  );
}
