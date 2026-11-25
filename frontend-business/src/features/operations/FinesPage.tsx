import { useEffect, useState, type FormEvent } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import { fetchCars, type CarItem } from '../fleet/fleetApi';
import { billFine, createFine, fetchFines, setFineStatus, type FineRow } from './operationsApi';

export function FinesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<FineRow[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [carID, setCarID] = useState('');
  const [fineType, setFineType] = useState<'Speeding' | 'Parking' | 'Toll' | 'Other'>('Speeding');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [amount, setAmount] = useState('');
  const [refNo, setRefNo] = useState('');
  const [desc, setDesc] = useState('');

  function load() {
    fetchFines()
      .then((res) => setRows(res.data))
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load fines'));
  }

  useEffect(() => {
    load();
    fetchCars({ page: 1, pageSize: 100 }).then((res) => setCars(res.items)).catch(() => undefined);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createFine({
        carID: Number(carID),
        fineType,
        occurredAt,
        amount: Number(amount),
        referenceNo: refNo.trim() || null,
        description: desc.trim() || null,
      });
      setAmount('');
      setRefNo('');
      setDesc('');
      showSuccess('Traffic fine logged (reservation matched automatically)');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Traffic Fines &amp; Tolls</h1>
        <p className="text-sm text-slate-500">Matched to reservations automatically by car and timestamp.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-6">
        <select
          required
          value={carID}
          onChange={(e) => setCarID(e.target.value)}
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
          value={fineType}
          onChange={(e) => setFineType(e.target.value as typeof fineType)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="Speeding">Speeding</option>
          <option value="Parking">Parking</option>
          <option value="Toll">Toll</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="datetime-local"
          required
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (€) *"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={refNo}
          onChange={(e) => setRefNo(e.target.value)}
          placeholder="Reference #"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Log fine
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3">Type / Ref</th>
              <th className="px-4 py-3">Occurred</th>
              <th className="px-4 py-3">Reservation / Client</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((f) => (
              <tr key={f.fineID}>
                <td className="px-4 py-2.5 font-mono text-xs font-medium">{f.plate}</td>
                <td className="px-4 py-2.5 text-xs">
                  <div>{f.fineType}</div>
                  <div className="text-slate-500">{f.referenceNo ?? '—'}</div>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-600">
                  {new Date(f.occurredAt).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {f.reservationID ? `#${f.reservationID} · ${f.clientName}` : 'Unmatched'}
                </td>
                <td className="px-4 py-2.5 font-medium">€{Number(f.amount).toFixed(2)}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={f.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    {f.status === 'Received' && f.reservationID && (
                      <button
                        type="button"
                        onClick={() =>
                          billFine(f.fineID)
                            .then(() => {
                              showSuccess('Fine billed to client');
                              load();
                            })
                            .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                        }
                        className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-white"
                      >
                        Bill client
                      </button>
                    )}
                    <select
                      value={f.status}
                      onChange={(e) =>
                        setFineStatus(f.fineID, e.target.value)
                          .then(() => {
                            showSuccess('Status updated');
                            load();
                          })
                          .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                      }
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    >
                      <option value="Received">Received</option>
                      <option value="Billed">Billed</option>
                      <option value="Paid">Paid</option>
                      <option value="Disputed">Disputed</option>
                      <option value="Void">Void</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
