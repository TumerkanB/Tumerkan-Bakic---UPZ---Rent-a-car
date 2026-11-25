import { Car, Check } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { fetchClients, type ClientListRow } from '../clients/clientsApi';
import { fetchBranches, type BranchItem } from '../fleet/fleetApi';
import { fetchDropoffsAdmin, type DropoffAdminRow } from '../reference/referenceApi';
import {
  createReservation,
  fetchAvailableCarsForBooking,
  type AvailableCarCard,
} from './reservationsApi';

export function NewReservationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffAdminRow[]>([]);
  const [clients, setClients] = useState<ClientListRow[]>([]);
  const [clientSearch, setClientSearch] = useState('');

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [pickupBranchID, setPickupBranchID] = useState(user?.branchID ? String(user.branchID) : '');
  const [dropoffLocationID, setDropoffLocationID] = useState('');

  const [availableCars, setAvailableCars] = useState<AvailableCarCard[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState<AvailableCarCard | null>(null);
  const [selectedClientID, setSelectedClientID] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchBranches(),
      fetchDropoffsAdmin({ page: 1, pageSize: 100, isActive: 'true' }),
    ])
      .then(([br, dl]) => {
        const active = br.items.filter((b) => b.isActive === 1);
        setBranches(active);
        setDropoffs(dl.data);
        if (!pickupBranchID && active[0]) {
          setPickupBranchID(String(active[0].branchID));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchClients({ page: 1, pageSize: 20, q: clientSearch || undefined, isActive: 'true' })
      .then((res) => setClients(res.data))
      .catch(() => undefined);
  }, [clientSearch]);

  async function handleFindCars(e: FormEvent) {
    e.preventDefault();
    setLoadingCars(true);
    try {
      const res = await fetchAvailableCarsForBooking({
        startDate,
        endDate,
        branchID: pickupBranchID ? Number(pickupBranchID) : undefined,
      });
      setAvailableCars(res.items);
      setStep(2);
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Unable to fetch available cars');
    } finally {
      setLoadingCars(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (!selectedCar || !selectedClientID) return;
    setSubmitting(true);
    try {
      const res = await createReservation({
        clientID: Number(selectedClientID),
        carID: selectedCar.carID,
        startDate,
        endDate,
        pickupBranchID: Number(pickupBranchID),
        dropoffLocationID: dropoffLocationID ? Number(dropoffLocationID) : null,
        promoCode: promoCode.trim() || undefined,
      });
      showSuccess(`Reservation #${res.reservationID} created`);
      navigate(`/reservations/${res.reservationID}`);
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Unable to create reservation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New Reservation</h1>
          <p className="text-sm text-slate-500">Step {step} of 3</p>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleFindCars} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up date &amp; time *</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Return date &amp; time *</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up branch *</label>
              <select
                required
                disabled={user?.branchID !== null}
                value={pickupBranchID}
                onChange={(e) => setPickupBranchID(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
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
              <label className="mb-1 block text-xs font-medium text-slate-700">Drop-off location (optional)</label>
              <select
                value={dropoffLocationID}
                onChange={(e) => setDropoffLocationID(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Same as pick-up branch</option>
                {dropoffs.map((d) => (
                  <option key={d.locationID} value={d.locationID}>
                    {d.locationName} ({d.branchName}) — €{Number(d.dropoffFee).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loadingCars}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {loadingCars ? 'Checking availability...' : 'Find available cars'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">{availableCars.length} available cars for selected dates</p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              Change dates
            </button>
          </div>

          {availableCars.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No cars available for these dates (check car status, compliance expiry, and pricing).
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableCars.map((car) => (
                <button
                  key={car.carID}
                  type="button"
                  onClick={() => {
                    setSelectedCar(car);
                    setStep(3);
                  }}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-blue-500"
                >
                  <div className="flex aspect-[16/10] w-full items-center justify-center bg-slate-50">
                    {car.thumbnail ? (
                      <img src={car.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : car.brandLogo ? (
                      <img src={car.brandLogo} alt="" className="max-h-14 object-contain" />
                    ) : (
                      <Car className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-slate-500">{car.categoryName}</div>
                    <div className="font-semibold text-slate-900">
                      {car.brandName} {car.modelName}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {car.plate} · {car.transmission} · {car.fuelType}
                    </div>
                    <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2">
                      <span className="text-base font-semibold text-slate-900">
                        €{Number(car.estimatedTotal).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">
                        €{Number(car.dailyRate).toFixed(2)}/day · Dep: €{Number(car.depositAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedCar && (
        <form onSubmit={handleConfirm} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
            <div>
              <strong>
                {selectedCar.brandName} {selectedCar.modelName} ({selectedCar.plate})
              </strong>
              <div className="text-xs text-slate-500">
                Estimated total: €{Number(selectedCar.estimatedTotal).toFixed(2)} · Deposit: €
                {Number(selectedCar.depositAmount).toFixed(2)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Change car
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">Select client *</label>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search client by name, email, phone..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              required
              value={selectedClientID}
              onChange={(e) => setSelectedClientID(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Choose client...</option>
              {clients.map((cl) => (
                <option key={cl.clientID} value={cl.clientID}>
                  {cl.name} {cl.surname} ({cl.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Promo code (optional)</label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="SUMMER10"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedClientID}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Confirm reservation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
