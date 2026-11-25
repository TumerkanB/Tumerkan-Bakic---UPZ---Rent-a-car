import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Car,
  CheckCircle2,
  Star,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { FileUploader } from '../../components/ui/FileUploader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import {
  addCarImage,
  createMaintenance,
  deleteCarImage,
  deleteMaintenance,
  fetchBranches,
  fetchCarWorkspace,
  fetchCategories,
  markDamageRepaired,
  reorderCarImages,
  reportCarDamage,
  setCarPrice,
  setPrimaryCarImage,
  updateCar,
  type BranchItem,
  type CarItem,
  type CarWorkspaceResponse,
  type CategoryItem,
} from './fleetApi';

type Tab = 'overview' | 'gallery' | 'prices' | 'maintenance' | 'damages' | 'fines';

export function CarDetailPage() {
  const { carID } = useParams();
  const id = Number(carID);
  const { showSuccess, showError } = useToast();

  const [tab, setTab] = useState<Tab>('overview');
  const [workspace, setWorkspace] = useState<CarWorkspaceResponse | null>(null);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Overview editable form
  const [formCar, setFormCar] = useState<CarItem | null>(null);
  const [savingCar, setSavingCar] = useState(false);

  // Gallery
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  // Pricing
  const [newRate, setNewRate] = useState('');
  const [rateFrom, setRateFrom] = useState(() => new Date().toISOString().split('T')[0]!);

  // Maintenance
  const [maintType, setMaintType] = useState('Service');
  const [maintDate, setMaintDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [maintMileage, setMaintMileage] = useState('');
  const [maintCost, setMaintCost] = useState('0');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintBy, setMaintBy] = useState('');
  const [maintNextDate, setMaintNextDate] = useState('');
  const [maintNextMileage, setMaintNextMileage] = useState('');

  // Damages
  const [dmgDesc, setDmgDesc] = useState('');
  const [dmgCost, setDmgCost] = useState('');
  const [repairingId, setRepairingId] = useState<number | null>(null);
  const [repairFinalCost, setRepairFinalCost] = useState('0');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchCarWorkspace(id), fetchBranches(), fetchCategories()])
      .then(([ws, br, cat]) => {
        setWorkspace(ws);
        setFormCar(ws.car);
        setBranches(br.items);
        setCategories(cat.items);
        setMaintMileage(String(ws.car.currentMileage));
      })
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load car'))
      .finally(() => setLoading(false));
  }, [id, showError]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !workspace) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading car workspace...</div>;
  }

  if (!workspace || !formCar) {
    return <div className="py-12 text-center text-sm text-red-600">Car not found.</div>;
  }

  const car = workspace.car;

  async function handleSaveOverview(e: FormEvent) {
    e.preventDefault();
    if (!formCar) return;
    setSavingCar(true);
    try {
      await updateCar(car.carID, {
        categoryID: formCar.categoryID,
        branchID: formCar.branchID,
        plate: formCar.plate,
        color: formCar.color,
        fuelType: formCar.fuelType,
        transmission: formCar.transmission,
        status: formCar.status,
        currentMileage: formCar.currentMileage,
        insuranceExpiry: formCar.insuranceExpiry,
        registrationExpiry: formCar.registrationExpiry,
        inspectionExpiry: formCar.inspectionExpiry,
        nextServiceDate: formCar.nextServiceDate,
        nextServiceMileage: formCar.nextServiceMileage,
      });
      showSuccess('Vehicle updated');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update vehicle');
    } finally {
      setSavingCar(false);
    }
  }

  async function handleAddImage(url: string, makePrimary = false) {
    try {
      await addCarImage(car.carID, url, newImageCaption.trim() || null, makePrimary);
      setNewImageUrl('');
      setNewImageCaption('');
      showSuccess('Image added');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to add image');
    }
  }

  async function handleMoveImage(index: number, direction: -1 | 1) {
    const imgs = car.images ?? [];
    const target = index + direction;
    if (target < 0 || target >= imgs.length) return;
    const copy = [...imgs];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved!);
    try {
      await reorderCarImages(
        car.carID,
        copy.map((i) => i.imageID),
      );
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to reorder images');
    }
  }

  async function handleSetPrice(e: FormEvent) {
    e.preventDefault();
    try {
      await setCarPrice(car.carID, Number(newRate), rateFrom);
      setNewRate('');
      showSuccess('Car price updated');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to set price');
    }
  }

  async function handleAddMaintenance(e: FormEvent) {
    e.preventDefault();
    try {
      await createMaintenance(car.carID, {
        serviceType: maintType,
        serviceDate: maintDate,
        mileage: Number(maintMileage),
        cost: Number(maintCost),
        description: maintDesc.trim() || null,
        performedBy: maintBy.trim() || null,
        nextDueDate: maintNextDate || null,
        nextDueMileage: maintNextMileage ? Number(maintNextMileage) : null,
      });
      setMaintDesc('');
      setMaintBy('');
      showSuccess('Maintenance record added');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to add maintenance');
    }
  }

  async function handleReportDamage(e: FormEvent) {
    e.preventDefault();
    try {
      await reportCarDamage(car.carID, {
        description: dmgDesc.trim(),
        repairCost: dmgCost ? Number(dmgCost) : null,
      });
      setDmgDesc('');
      setDmgCost('');
      showSuccess('Damage reported');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to report damage');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'gallery', label: `Gallery (${car.images?.length ?? 0})` },
    { id: 'prices', label: 'Prices' },
    { id: 'maintenance', label: `Maintenance (${workspace.maintenance.length})` },
    { id: 'damages', label: `Damages (${workspace.damages.length})` },
    { id: 'fines', label: 'Fines & Reservations' },
  ];

  const primaryImg = car.images?.find((i) => i.isPrimary === 1)?.fileReference ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.CARS_MANAGE}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-slate-900">
                {car.brandName} {car.modelName}
              </h1>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                {car.plate}
              </span>
              <StatusBadge status={car.status} />
            </div>
            <p className="text-xs text-slate-500">
              {car.categoryName} · {car.branchName} · {car.transmission} · {car.fuelType}
            </p>
          </div>
        </div>
      </div>

      {car.issues && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Compliance issues:</strong> {car.issues}
          </span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSaveOverview}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Plate</label>
                <input
                  type="text"
                  required
                  value={formCar.plate}
                  onChange={(e) => setFormCar({ ...formCar, plate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
                <select
                  value={formCar.status}
                  onChange={(e) =>
                    setFormCar({ ...formCar, status: e.target.value as CarItem['status'] })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Branch</label>
                <select
                  value={formCar.branchID}
                  onChange={(e) => setFormCar({ ...formCar, branchID: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                  value={formCar.categoryID}
                  onChange={(e) => setFormCar({ ...formCar, categoryID: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                  value={formCar.fuelType}
                  onChange={(e) =>
                    setFormCar({ ...formCar, fuelType: e.target.value as CarItem['fuelType'] })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                  value={formCar.transmission}
                  onChange={(e) =>
                    setFormCar({
                      ...formCar,
                      transmission: e.target.value as CarItem['transmission'],
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
                  value={formCar.currentMileage}
                  onChange={(e) =>
                    setFormCar({ ...formCar, currentMileage: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Color</label>
                <input
                  type="text"
                  value={formCar.color ?? ''}
                  onChange={(e) => setFormCar({ ...formCar, color: e.target.value || null })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Insurance expiry</label>
                <input
                  type="date"
                  value={formCar.insuranceExpiry ?? ''}
                  onChange={(e) =>
                    setFormCar({ ...formCar, insuranceExpiry: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Registration expiry</label>
                <input
                  type="date"
                  value={formCar.registrationExpiry ?? ''}
                  onChange={(e) =>
                    setFormCar({ ...formCar, registrationExpiry: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Inspection expiry</label>
                <input
                  type="date"
                  value={formCar.inspectionExpiry ?? ''}
                  onChange={(e) =>
                    setFormCar({ ...formCar, inspectionExpiry: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Next service date</label>
                <input
                  type="date"
                  value={formCar.nextServiceDate ?? ''}
                  onChange={(e) =>
                    setFormCar({ ...formCar, nextServiceDate: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={savingCar}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingCar ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">Vehicle rules</h2>
            <ul className="list-disc space-y-2 pl-4">
              <li>A car in Maintenance or Inactive status cannot be booked.</li>
              <li>Reporting an unrepaired damage automatically sets the car to Maintenance.</li>
              <li>Insurance, registration, and inspection must remain valid until the end of a rental.</li>
              <li>Mileage cannot be lowered below its current reading.</li>
              <li>A car with gallery images cannot be deleted until its images are removed first.</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'gallery' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL or upload file..."
                className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newImageCaption}
                onChange={(e) => setNewImageCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <FileUploader kind="image" onUploaded={(url) => handleAddImage(url, false)} />
              <button
                type="button"
                disabled={!newImageUrl.trim()}
                onClick={() => handleAddImage(newImageUrl.trim(), false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add URL
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(car.images ?? []).map((img, idx) => (
                <div key={img.imageID} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <img src={img.fileReference} alt={img.caption ?? ''} className="h-44 w-full object-cover" />
                  <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPrimaryCarImage(car.carID, img.imageID)
                          .then(() => {
                            showSuccess('Main image updated');
                            load();
                          })
                          .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                      }
                      className={`inline-flex items-center gap-1 text-xs ${
                        img.isPrimary === 1 ? 'font-semibold text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" />
                      {img.isPrimary === 1 ? 'Main thumbnail' : 'Set main'}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, -1)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (car.images?.length ?? 1) - 1}
                        onClick={() => handleMoveImage(idx, 1)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          deleteCarImage(car.carID, img.imageID)
                            .then(() => {
                              showSuccess('Image deleted');
                              load();
                            })
                            .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                        }
                        className="rounded p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Search card preview
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex aspect-[16/10] items-center justify-center bg-slate-50">
                {primaryImg ? (
                  <img src={primaryImg} alt="" className="h-full w-full object-cover" />
                ) : (car.manufacturerLogo || car.brandLogo) ? (
                  <img
                    src={(car.manufacturerLogo || car.brandLogo)!}
                    alt=""
                    className="max-h-16 object-contain opacity-80"
                  />
                ) : (
                  <Car className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-slate-900">
                  {car.brandName} {car.modelName}
                </div>
                <div className="text-xs text-slate-500">
                  {car.transmission} · {car.fuelType}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'prices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs text-slate-500">Effective daily rate today</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {workspace.pricing.effectiveDailyRate !== null
                  ? `€${Number(workspace.pricing.effectiveDailyRate).toFixed(2)}`
                  : 'Not priced'}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Active rule: <strong>{workspace.pricing.priceSource}</strong>
              </div>
            </div>

            <form onSubmit={handleSetPrice} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Set car-specific price from date
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Daily rate (€)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  required
                  value={rateFrom}
                  onChange={(e) => setRateFrom(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Apply new price
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Car price history</h3>
              <table className="mt-3 min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Rate</th>
                    <th className="py-2">From</th>
                    <th className="py-2">To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workspace.pricing.priceHistory.map((p) => (
                    <tr key={p.priceID}>
                      <td className="py-2 font-medium text-slate-900">€{Number(p.dailyRate).toFixed(2)}</td>
                      <td className="py-2">{p.effectiveFrom}</td>
                      <td className="py-2">{p.effectiveTo ?? 'Open'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Price audit log (read-only)</h3>
              <table className="mt-3 min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Action</th>
                    <th className="py-2">Old → New</th>
                    <th className="py-2">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workspace.pricing.priceAuditLog.map((a) => (
                    <tr key={a.auditID}>
                      <td className="py-2">{a.actionType}</td>
                      <td className="py-2">
                        {a.oldDailyRate != null ? `€${a.oldDailyRate}` : '—'} →{' '}
                        {a.newDailyRate != null ? `€${a.newDailyRate}` : '—'}
                      </td>
                      <td className="py-2">{a.changedByUser ?? a.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddMaintenance}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4"
          >
            <select
              value={maintType}
              onChange={(e) => setMaintType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="Service">Service</option>
              <option value="Repair">Repair</option>
              <option value="Tyres">Tyres</option>
              <option value="Inspection">Inspection</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="date"
              required
              value={maintDate}
              onChange={(e) => setMaintDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              required
              value={maintMileage}
              onChange={(e) => setMaintMileage(e.target.value)}
              placeholder="Mileage"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={maintCost}
              onChange={(e) => setMaintCost(e.target.value)}
              placeholder="Cost (€)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={maintBy}
              onChange={(e) => setMaintBy(e.target.value)}
              placeholder="Performed by"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={maintNextDate}
              onChange={(e) => setMaintNextDate(e.target.value)}
              title="Next due date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              value={maintNextMileage}
              onChange={(e) => setMaintNextMileage(e.target.value)}
              placeholder="Next due km"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add record
            </button>
            <input
              type="text"
              value={maintDesc}
              onChange={(e) => setMaintDesc(e.target.value)}
              placeholder="Description / notes"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-4"
            />
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Mileage</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspace.maintenance.map((m) => (
                  <tr key={m.maintenanceID}>
                    <td className="px-4 py-2.5">{m.serviceDate}</td>
                    <td className="px-4 py-2.5 font-medium">{m.serviceType}</td>
                    <td className="px-4 py-2.5">{m.mileage.toLocaleString()} km</td>
                    <td className="px-4 py-2.5">€{Number(m.cost).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{m.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          deleteMaintenance(m.maintenanceID)
                            .then(() => {
                              showSuccess('Record deleted');
                              load();
                            })
                            .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                        }
                        className="rounded p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'damages' && (
        <div className="space-y-6">
          <form onSubmit={handleReportDamage} className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <input
              type="text"
              required
              value={dmgDesc}
              onChange={(e) => setDmgDesc(e.target.value)}
              placeholder="Damage description *"
              className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={dmgCost}
              onChange={(e) => setDmgCost(e.target.value)}
              placeholder="Est. repair cost (€)"
              className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Report damage
            </button>
          </form>

          <div className="space-y-3">
            {workspace.damages.map((d) => (
              <div
                key={d.damageID}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">#{d.damageID}</span>
                    {d.isRepaired === 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Repaired
                      </span>
                    ) : (
                      <StatusBadge status="Maintenance" />
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">{d.description}</p>
                  <p className="text-xs text-slate-500">
                    Repair cost: {d.repairCost != null ? `€${Number(d.repairCost).toFixed(2)}` : '—'}
                  </p>
                </div>

                {d.isRepaired === 0 && (
                  <div className="flex items-center gap-2">
                    {repairingId === d.damageID ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={repairFinalCost}
                          onChange={(e) => setRepairFinalCost(e.target.value)}
                          className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            markDamageRepaired(d.damageID, Number(repairFinalCost))
                              .then(() => {
                                setRepairingId(null);
                                showSuccess('Marked as repaired');
                                load();
                              })
                              .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        >
                          Confirm
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRepairingId(d.damageID);
                          setRepairFinalCost(String(d.repairCost ?? 0));
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Mark repaired
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'fines' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Traffic fines</h3>
            {workspace.fines.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No fines recorded.</p>
            ) : (
              <div className="mt-3 divide-y divide-slate-100 text-xs">
                {workspace.fines.map((f) => (
                  <div key={f.fineID} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="font-medium text-slate-900">
                        {f.fineType} · €{Number(f.amount).toFixed(2)}
                      </div>
                      <div className="text-slate-500">{f.referenceNo ?? 'No ref'}</div>
                    </div>
                    <StatusBadge status={f.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Reservations</h3>
            {workspace.reservations.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No reservations yet.</p>
            ) : (
              <div className="mt-3 divide-y divide-slate-100 text-xs">
                {workspace.reservations.map((r) => (
                  <div key={r.reservationID} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="font-medium text-slate-900">
                        #{r.reservationID} · {r.clientName}
                      </div>
                      <div className="text-slate-500">
                        {new Date(r.startDate).toLocaleDateString()} –{' '}
                        {new Date(r.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
