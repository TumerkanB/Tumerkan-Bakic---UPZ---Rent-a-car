import { ArrowLeft, Check, Play, Trash2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { FileUploader } from '../../components/ui/FileUploader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import {
  addCharge,
  addDriver,
  addExtra,
  applyPromo,
  cancelReservation,
  completeRental,
  fetchReservationWorkspace,
  issueReservationInvoice,
  recordCondition,
  recordReservationPayment,
  refundOverpayment,
  removeDriver,
  removePromo,
  settleDeposit,
  startRental,
  updateReservationDates,
  type ReservationWorkspace,
} from './reservationsApi';

export function ReservationDetailPage() {
  const { id } = useParams();
  const resID = Number(id);
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useToast();

  const [ws, setWs] = useState<ReservationWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [extraID, setExtraID] = useState('');
  const [extraQty, setExtraQty] = useState('1');
  const [driverIdInput, setDriverIdInput] = useState('');

  // Charge form
  const [chargeType, setChargeType] = useState('Extra');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeQty, setChargeQty] = useState('1');
  const [chargeUnit, setChargeUnit] = useState('0');

  // Condition report form
  const [condStage, setCondStage] = useState<'Pickup' | 'Return'>('Pickup');
  const [condMileage, setCondMileage] = useState('');
  const [condFuel, setCondFuel] = useState('100');
  const [condClean, setCondClean] = useState(true);
  const [condDamage, setCondDamage] = useState('');
  const [condNotes, setCondNotes] = useState('');
  const [condPhotos, setCondPhotos] = useState<{ fileReference: string; caption?: string }[]>([]);

  // Complete / Cancel
  const [endMileage, setEndMileage] = useState('');
  const [returnedAt, setReturnedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [cancelReason, setCancelReason] = useState('');

  // Payment form
  const [payType, setPayType] = useState<'Payment' | 'Refund' | 'Deposit' | 'DepositRefund'>('Deposit');
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('EUR');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'BankTransfer' | 'Other'>('Card');
  const [payRef, setPayRef] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchReservationWorkspace(resID)
      .then((data) => {
        setWs(data);
        setEditStart(data.reservation.startDate.slice(0, 16));
        setEditEnd(data.reservation.endDate.slice(0, 16));
        setCondStage(data.reservation.status === 'Active' ? 'Return' : 'Pickup');
        setCondMileage(String(data.reservation.currentMileage));
        setEndMileage(String(data.reservation.currentMileage));
        if (data.reservation.status === 'Active' || data.reservation.status === 'Completed') {
          setPayType('Payment');
        }
      })
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load reservation'))
      .finally(() => setLoading(false));
  }, [resID, showError]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !ws) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading reservation...</div>;
  }
  if (!ws) {
    return <div className="py-12 text-center text-sm text-red-600">Reservation not found.</div>;
  }

  const r = ws.reservation;
  const bal = ws.balance;
  const isPending = r.status === 'Pending';
  const isActive = r.status === 'Active';
  const isCompleted = r.status === 'Completed';

  async function runAction(fn: () => Promise<unknown>, successMsg: string) {
    try {
      await fn();
      showSuccess(successMsg);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Action failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.RESERVATIONS}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-slate-900">Reservation #{r.reservationID}</h1>
              <StatusBadge status={r.status} />
              {bal && <StatusBadge status={bal.paymentStatus} />}
            </div>
            <p className="text-xs text-slate-500">
              {r.clientName} ({r.clientEmail}) · {r.brandName} {r.modelName} ({r.plate}) · {r.pickupBranch} →{' '}
              {r.dropoffPlace}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isPending && (
            <button
              type="button"
              onClick={() => runAction(() => startRental(resID), 'Rental started (Active)')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              Start rental
            </button>
          )}
        </div>
      </div>

      {/* Balance Summary Cards */}
      {bal && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Rental (after disc.)</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">€{Number(bal.rentalDue).toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Extra charges + Tax</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              €{(Number(bal.charges) + Number(bal.tax)).toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Total due</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">€{Number(bal.totalDue).toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Paid / Balance</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              €{Number(bal.paid).toFixed(2)} /{' '}
              <span className={Number(bal.balance) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                €{Number(bal.balance).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">Deposit held / req.</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              €{Number(bal.depositHeld).toFixed(2)} / €{Number(bal.depositRequired).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Operations */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pending: Edit dates, Promo, Extras, Drivers, Cancel */}
          {isPending && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Pending Reservation Controls</h2>

              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  runAction(() => updateReservationDates(resID, editStart, editEnd), 'Dates & price updated');
                }}
                className="flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Start</label>
                  <input
                    type="datetime-local"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">End</label>
                  <input
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  Update dates
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={() => runAction(() => applyPromo(resID, promoInput), 'Promo applied')}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Apply promo
                </button>
                {r.promoCode && (
                  <button
                    type="button"
                    onClick={() => runAction(() => removePromo(resID), 'Promo removed')}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700"
                  >
                    Remove ({r.promoCode})
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <select
                  value={extraID}
                  onChange={(e) => setExtraID(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                >
                  <option value="">Add rental extra...</option>
                  {ws.availableExtras.map((ex) => (
                    <option key={ex.extraID} value={ex.extraID}>
                      {ex.extraName} (€{Number(ex.unitPrice).toFixed(2)} {ex.pricingType})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={extraQty}
                  onChange={(e) => setExtraQty(e.target.value)}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={!extraID}
                  onClick={() =>
                    runAction(() => addExtra(resID, Number(extraID), Number(extraQty)), 'Extra added')
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Add extra
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="number"
                  value={driverIdInput}
                  onChange={(e) => setDriverIdInput(e.target.value)}
                  placeholder="Additional driver Client ID"
                  className="w-48 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={!driverIdInput}
                  onClick={() =>
                    runAction(() => addDriver(resID, Number(driverIdInput)), 'Additional driver added')
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Add driver
                </button>
                {ws.drivers.map((d) => (
                  <span
                    key={d.clientID}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs"
                  >
                    {d.name} {d.surname}
                    <button
                      type="button"
                      onClick={() => runAction(() => removeDriver(resID, d.clientID), 'Driver removed')}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Cancellation reason..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={!cancelReason.trim()}
                  onClick={() =>
                    runAction(() => cancelReservation(resID, cancelReason.trim()), 'Reservation cancelled')
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel reservation
                </button>
              </div>
            </div>
          )}

          {/* Active: Complete rental */}
          {isActive && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAction(
                  () => completeRental(resID, Number(endMileage), returnedAt),
                  'Rental completed',
                );
              }}
              className="flex flex-wrap items-end gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-5"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">End mileage (km)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={endMileage}
                  onChange={(e) => setEndMileage(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Returned at</label>
                <input
                  type="datetime-local"
                  required
                  value={returnedAt}
                  onChange={(e) => setReturnedAt(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                Complete rental
              </button>
            </form>
          )}

          {/* Condition Report Form (Pending -> Pickup, Active -> Return) */}
          {(isPending || isActive) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAction(
                  () =>
                    recordCondition(resID, {
                      stage: condStage,
                      mileage: Number(condMileage),
                      fuelPercent: Number(condFuel),
                      isClean: condClean,
                      existingDamage: condDamage.trim() || null,
                      notes: condNotes.trim() || null,
                      photos: condPhotos,
                    }),
                  `${condStage} condition report recorded`,
                );
              }}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                Record {condStage} Condition Report
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Mileage (km)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={condMileage}
                    onChange={(e) => setCondMileage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600">Fuel ({condFuel}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={condFuel}
                    onChange={(e) => setCondFuel(e.target.value)}
                    className="w-full"
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={condClean}
                    onChange={(e) => setCondClean(e.target.checked)}
                  />
                  Vehicle is clean
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={condDamage}
                  onChange={(e) => setCondDamage(e.target.value)}
                  placeholder="Existing damage..."
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                />
                <input
                  type="text"
                  value={condNotes}
                  onChange={(e) => setCondNotes(e.target.value)}
                  placeholder="Notes..."
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FileUploader
                  kind="image"
                  label="Attach condition photo"
                  onUploaded={(url) => setCondPhotos((p) => [...p, { fileReference: url }])}
                />
                <span className="text-xs text-slate-500">{condPhotos.length} photos attached</span>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                Save {condStage} condition
              </button>
            </form>
          )}

          {/* Condition Comparison */}
          {ws.conditionCompare && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs">
              <h2 className="text-sm font-semibold text-slate-900">Condition Comparison</h2>
              <div className="mt-2 grid grid-cols-3 gap-4 text-slate-600">
                <div>
                  Pick-up: {ws.conditionCompare.pickupMileage ?? '—'} km ·{' '}
                  {ws.conditionCompare.pickupFuel ?? '—'}%
                </div>
                <div>
                  Return: {ws.conditionCompare.returnMileage ?? '—'} km ·{' '}
                  {ws.conditionCompare.returnFuel ?? '—'}%
                </div>
                <div>
                  Driven: {ws.conditionCompare.distanceDriven ?? '—'} km · Fuel used:{' '}
                  {ws.conditionCompare.fuelUsedPercent ?? '—'}%
                </div>
              </div>
            </div>
          )}

          {/* Charges */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Charges (read-only)</h2>
            {(isPending || isActive) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runAction(
                    () =>
                      addCharge(resID, {
                        chargeType,
                        description: chargeDesc.trim(),
                        quantity: Number(chargeQty),
                        unitAmount: Number(chargeUnit),
                      }),
                    'Charge added',
                  );
                }}
                className="flex flex-wrap gap-2"
              >
                <select
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="Extra">Extra</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="LateFee">LateFee</option>
                  <option value="Toll">Toll</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  required
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="Description"
                  className="min-w-[160px] flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={chargeQty}
                  onChange={(e) => setChargeQty(e.target.value)}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={chargeUnit}
                  onChange={(e) => setChargeUnit(e.target.value)}
                  placeholder="€"
                  className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  Add charge
                </button>
              </form>
            )}

            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2">Type</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Qty × Unit</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ws.charges.map((ch) => (
                  <tr key={ch.chargeID}>
                    <td className="py-2 font-medium">{ch.chargeType}</td>
                    <td className="py-2">{ch.description}</td>
                    <td className="py-2">
                      {ch.quantity} × €{Number(ch.unitAmount).toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-medium">€{Number(ch.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right col: Payments & Invoices */}
        <div className="space-y-6">
          {hasPermission('MANAGE_PAYMENTS') && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-900">Payments &amp; Deposits</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runAction(
                    () =>
                      recordReservationPayment(resID, {
                        paymentType: payType,
                        amount: Number(payAmount),
                        currencyCode: payCurrency,
                        method: payMethod,
                        reference: payRef.trim() || null,
                      }),
                    'Payment recorded',
                  );
                }}
                className="space-y-2.5"
              >
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as typeof payType)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Payment">Payment</option>
                    <option value="DepositRefund">DepositRefund</option>
                    <option value="Refund">Refund</option>
                  </select>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="BankTransfer">BankTransfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Amount"
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <select
                    value={payCurrency}
                    onChange={(e) => setPayCurrency(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    {ws.currencies.map((c) => (
                      <option key={c.currencyCode} value={c.currencyCode}>
                        {c.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Reference (optional)"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Record {payType}
                </button>
              </form>

              {(isCompleted || r.status === 'Cancelled') && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => runAction(() => settleDeposit(resID, payMethod), 'Deposit settled')}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Settle deposit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() => refundOverpayment(resID, payMethod), 'Overpayment refunded')
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Refund overpayment
                  </button>
                </div>
              )}

              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 text-xs">
                {ws.payments.map((p) => (
                  <div key={p.paymentID} className="flex justify-between py-2">
                    <div>
                      <div className="font-medium text-slate-900">
                        {p.receiptNumber} · {p.paymentType}
                      </div>
                      <div className="text-slate-500">
                        {p.method} · {new Date(p.paidAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900">
                      {Number(p.amount).toFixed(2)} {p.currencyCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasPermission('MANAGE_INVOICES') && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Invoices</h2>
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() => issueReservationInvoice(resID), 'Invoice issued')
                    }
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Issue invoice
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {ws.invoices.length === 0 ? (
                  <p className="text-slate-500">No invoices issued.</p>
                ) : (
                  ws.invoices.map((inv) => (
                    <div key={inv.invoiceID} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-mono font-medium">{inv.invoiceNumber}</div>
                        <div className="text-slate-500">{inv.invoiceType}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>
                          {Number(inv.total).toFixed(2)} {inv.currencyCode}
                        </strong>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
