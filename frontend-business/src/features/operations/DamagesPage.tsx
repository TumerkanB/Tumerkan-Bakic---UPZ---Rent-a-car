import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import { fetchCars, type CarItem } from '../fleet/fleetApi';
import {
  billDamage,
  fetchDamages,
  markDamageRepaired,
  reportDamage,
  type DamageRow,
} from './operationsApi';

export function DamagesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<DamageRow[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [carID, setCarID] = useState('');
  const [resID, setResID] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');
  const [billAmounts, setBillAmounts] = useState<Record<number, string>>({});

  function load() {
    fetchDamages()
      .then((res) => setRows(res.data))
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load damages'));
  }

  useEffect(() => {
    load();
    fetchCars({ page: 1, pageSize: 100 }).then((res) => setCars(res.items)).catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await reportDamage({
        carID: Number(carID),
        reservationID: resID ? Number(resID) : null,
        description: desc.trim(),
        repairCost: cost ? Number(cost) : null,
      });
      setDesc('');
      setCost('');
      setResID('');
      showSuccess('Damage reported');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Damage Reports</h1>
        <p className="text-sm text-slate-500">Report vehicle damages, bill clients, and mark repairs complete.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-5">
        <select
          required
          value={carID}
          onChange={(e) => setCarID(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select car *</option>
          {cars.map((c) => (
            <option key={c.carID} value={c.carID}>
              {c.plate} ({c.brandName} {c.modelName})
            </option>
          ))}
        </select>
        <input
          type="number"
          value={resID}
          onChange={(e) => setResID(e.target.value)}
          placeholder="Reservation # (opt)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Damage description *"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Est. €"
            className="w-24 rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
          />
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Report
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {rows.map((d) => (
          <div key={d.damageID} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">#{d.damageID}</span>
                <span className="font-semibold text-slate-900">
                  {d.plate} ({d.brandName} {d.modelName})
                </span>
                {d.isRepaired === 1 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Repaired
                  </span>
                ) : (
                  <StatusBadge status="Maintenance" />
                )}
                {d.billedChargeID && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    Billed (Charge #{d.billedChargeID})
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-700">{d.description}</p>
              <p className="text-xs text-slate-500">
                Repair cost: {d.repairCost != null ? `€${Number(d.repairCost).toFixed(2)}` : '—'}
                {d.reservationID ? ` · Reservation #${d.reservationID}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {d.reservationID && !d.billedChargeID && (
                <>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={billAmounts[d.damageID] ?? String(d.repairCost ?? '')}
                    onChange={(e) => setBillAmounts((p) => ({ ...p, [d.damageID]: e.target.value }))}
                    placeholder="Bill €"
                    className="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      billDamage(d.damageID, Number(billAmounts[d.damageID] ?? d.repairCost ?? 0))
                        .then(() => {
                          showSuccess('Damage billed to client');
                          load();
                        })
                        .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                    }
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Bill client
                  </button>
                </>
              )}
              {d.isRepaired === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    markDamageRepaired(d.damageID, Number(d.repairCost ?? 0))
                      .then(() => {
                        showSuccess('Marked repaired');
                        load();
                      })
                      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Mark repaired
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
