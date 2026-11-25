import { AlertTriangle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import { fetchCars, type CarItem } from '../fleet/fleetApi';
import {
  createGlobalMaintenance,
  fetchMaintenanceOverview,
  type MaintenanceGlobalRow,
} from './operationsApi';

export function MaintenancePage() {
  const { showSuccess, showError } = useToast();
  const [records, setRecords] = useState<MaintenanceGlobalRow[]>([]);
  const [serviceDue, setServiceDue] = useState<{ carID: number; plate: string; branchName: string; issues: string }[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);

  const [carID, setCarID] = useState('');
  const [serviceType, setServiceType] = useState('Service');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [mileage, setMileage] = useState('0');
  const [cost, setCost] = useState('0');
  const [desc, setDesc] = useState('');

  function load() {
    fetchMaintenanceOverview()
      .then((res) => {
        setRecords(res.records);
        setServiceDue(res.serviceDue);
      })
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load maintenance'));
  }

  useEffect(() => {
    load();
    fetchCars({ page: 1, pageSize: 100 }).then((res) => setCars(res.items)).catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createGlobalMaintenance({
        carID: Number(carID),
        serviceType,
        serviceDate,
        mileage: Number(mileage),
        cost: Number(cost),
        description: desc.trim() || null,
      });
      setDesc('');
      showSuccess('Maintenance record logged');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Maintenance &amp; Service Due</h1>
        <p className="text-sm text-slate-500">Log vehicle service records and monitor compliance warnings.</p>
      </div>

      {serviceDue.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Vehicles with Compliance / Service Issues ({serviceDue.length})
          </h2>
          <div className="mt-2 space-y-1.5 text-xs">
            {serviceDue.map((s) => (
              <div key={s.carID} className="flex items-center justify-between rounded bg-white px-3 py-2">
                <div>
                  <Link to={`/cars/${s.carID}`} className="font-mono font-semibold text-blue-600 hover:underline">
                    {s.plate}
                  </Link>{' '}
                  ({s.branchName})
                </div>
                <span className="text-amber-800">{s.issues}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-6">
        <select
          required
          value={carID}
          onChange={(e) => {
            setCarID(e.target.value);
            const car = cars.find((c) => c.carID === Number(e.target.value));
            if (car) setMileage(String(car.currentMileage));
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select car *</option>
          {cars.map((c) => (
            <option key={c.carID} value={c.carID}>
              {c.plate}
            </option>
          ))}
        </select>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
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
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          required
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder="Mileage"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          required
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost €"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Log service
        </button>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-6"
        />
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Mileage</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((m) => (
              <tr key={m.maintenanceID}>
                <td className="px-4 py-2.5 text-xs">{m.serviceDate}</td>
                <td className="px-4 py-2.5 font-mono text-xs font-medium">{m.plate}</td>
                <td className="px-4 py-2.5 text-xs">{m.serviceType}</td>
                <td className="px-4 py-2.5 text-xs">{m.mileage.toLocaleString()} km</td>
                <td className="px-4 py-2.5 text-xs font-medium">€{Number(m.cost).toFixed(2)}</td>
                <td className="px-4 py-2.5 text-xs text-slate-600">{m.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
