import { AlertTriangle, ArrowLeft, CheckCircle2, Trash2, Unlock } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AddressForm } from '../../components/ui/AddressForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { fetchAllCountries, type AddressInput, type CountryRow } from '../reference/referenceApi';
import {
  addVerification,
  deleteClientAdmin,
  deleteVerification,
  fetchClientWorkspace,
  setClientCredentials,
  unlockClientAccount,
  updateClientAdmin,
  updateVerification,
  type ClientWorkspaceResponse,
} from './clientsApi';

type Tab = 'profile' | 'credentials' | 'documents' | 'history';

export function ClientDetailPage() {
  const { clientID } = useParams();
  const id = Number(clientID);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [tab, setTab] = useState<Tab>('profile');
  const [ws, setWs] = useState<ClientWorkspaceResponse | null>(null);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [address, setAddress] = useState<AddressInput>({ street: '', number: '', apt: null, zip: '', cityID: 0 });
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Credentials form
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');

  // Document form
  const [docType, setDocType] = useState<'DrivingLicence' | 'Passport' | 'NationalID' | 'Other'>('DrivingLicence');
  const [docID, setDocID] = useState('');
  const [docCountryID, setDocCountryID] = useState('');
  const [docAttr, setDocAttr] = useState('');
  const [docIssue, setDocIssue] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docVerified, setDocVerified] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchClientWorkspace(id), fetchAllCountries()])
      .then(([data, co]) => {
        setWs(data);
        setCountries(co.data);
        const c = data.client;
        setName(c.name);
        setSurname(c.surname);
        setEmail(c.email);
        setPhone(c.phone ?? '');
        setDob(c.dateOfBirth ?? '');
        setIsActive(c.isActive === 1);
        setCredUsername(c.username ?? '');
        setAddress({
          street: c.street ?? '',
          number: c.number ?? '',
          apt: c.apt,
          zip: c.zip ?? '',
          cityID: c.cityID ?? 0,
        });
      })
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load client'))
      .finally(() => setLoading(false));
  }, [id, showError]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !ws) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading client...</div>;
  }
  if (!ws) {
    return <div className="py-12 text-center text-sm text-red-600">Client not found.</div>;
  }

  const c = ws.client;
  const isLocked = Boolean(c.lockedUntil && new Date(c.lockedUntil) > new Date());

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    try {
      await updateClientAdmin(id, {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        dateOfBirth: dob || null,
        isActive,
        address: address.cityID > 0 ? address : null,
      });
      showSuccess('Client updated');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update client');
    }
  }

  async function handleSetCredentials(e: FormEvent) {
    e.preventDefault();
    try {
      await setClientCredentials(id, credUsername.trim(), credPassword);
      setCredPassword('');
      showSuccess('Client login credentials updated');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update credentials');
    }
  }

  async function handleAddDoc(e: FormEvent) {
    e.preventDefault();
    try {
      await addVerification(id, {
        documentType: docType,
        documentID: docID.trim(),
        documentCountryID: Number(docCountryID),
        attribute: docAttr.trim() || null,
        issueDate: docIssue || null,
        expiryDate: docExpiry || null,
        isVerified: docVerified,
      });
      setDocID('');
      setDocAttr('');
      setDocIssue('');
      setDocExpiry('');
      setDocVerified(false);
      showSuccess('Document added');
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to add document');
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile & Address' },
    { id: 'credentials', label: 'Credentials & Lockout' },
    { id: 'documents', label: `Documents (${ws.verifications.length})` },
    { id: 'history', label: `History & Loyalty (${ws.reservations.length})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.CLIENTS}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-slate-900">
                {c.name} {c.surname}
              </h1>
              <StatusBadge status={c.isActive === 1 ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-xs text-slate-500">
              {c.email} · Loyalty discount: {c.loyaltyDiscountPercent}% · {c.totalRentals} rentals · €
              {Number(c.lifetimeSpend).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

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

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">First name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Last name *</label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Date of birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active client account
              </label>
            </div>
          </div>

          <AddressForm value={address} onChange={setAddress} />

          <div className="flex justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete client
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {tab === 'credentials' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={handleSetCredentials} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Set or reset client login</h2>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Username (min 3 chars, no spaces)</label>
              <input
                type="text"
                required
                minLength={3}
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">New password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save credentials
            </button>
          </form>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Security &amp; Lockout</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Last login</dt>
                <dd className="text-slate-900">
                  {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : 'Never'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Failed login attempts</dt>
                <dd className="text-slate-900">{c.failedLoginCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Locked until</dt>
                <dd className={isLocked ? 'font-medium text-red-600' : 'text-slate-900'}>
                  {c.lockedUntil ? new Date(c.lockedUntil).toLocaleString() : 'Not locked'}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() =>
                unlockClientAccount(id)
                  .then(() => {
                    showSuccess('Account unlocked');
                    load();
                  })
                  .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Unlock className="h-3.5 w-3.5" />
              Unlock account
            </button>
          </div>
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddDoc}
            className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4"
          >
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as typeof docType)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="DrivingLicence">DrivingLicence</option>
              <option value="Passport">Passport</option>
              <option value="NationalID">NationalID</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              required
              value={docID}
              onChange={(e) => setDocID(e.target.value)}
              placeholder="Document ID *"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              required
              value={docCountryID}
              onChange={(e) => setDocCountryID(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Issuing country *</option>
              {countries.map((co) => (
                <option key={co.countryID} value={co.countryID}>
                  {co.countryName}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={docAttr}
              onChange={(e) => setDocAttr(e.target.value)}
              placeholder="Category / note (e.g. B)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              required={docType === 'DrivingLicence'}
              value={docIssue}
              onChange={(e) => setDocIssue(e.target.value)}
              title="Issue date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              required={docType === 'DrivingLicence'}
              value={docExpiry}
              onChange={(e) => setDocExpiry(e.target.value)}
              title="Expiry date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center gap-2 px-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={docVerified}
                onChange={(e) => setDocVerified(e.target.checked)}
              />
              Mark verified
            </label>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add document
            </button>
          </form>

          <div className="space-y-3">
            {ws.verifications.map((v) => {
              const expired = Boolean(v.expiryDate && v.expiryDate < new Date().toISOString().split('T')[0]!);
              return (
                <div
                  key={v.verificationID}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{v.documentType}</span>
                      <span className="font-mono text-xs text-slate-600">{v.documentID}</span>
                      {v.isVerified === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <StatusBadge status="Pending" />
                      )}
                      {expired && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {v.documentCountry ?? '—'} · Issue: {v.issueDate ?? '—'} · Expiry: {v.expiryDate ?? '—'}
                      {v.attribute ? ` · ${v.attribute}` : ''}
                      {v.verifiedBy ? ` · Verified by ${v.verifiedBy}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateVerification(v.verificationID, {
                          documentType: v.documentType,
                          documentID: v.documentID,
                          documentCountryID: v.documentCountryID,
                          attribute: v.attribute,
                          issueDate: v.issueDate,
                          expiryDate: v.expiryDate,
                          isVerified: v.isVerified !== 1,
                        })
                          .then(() => {
                            showSuccess(v.isVerified === 1 ? 'Marked unverified' : 'Document verified');
                            load();
                          })
                          .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                      }
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {v.isVerified === 1 ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteVerification(v.verificationID)
                          .then(() => {
                            showSuccess('Document deleted');
                            load();
                          })
                          .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                      }
                      className="rounded p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Reservations</h3>
            {ws.reservations.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">No reservations.</p>
            ) : (
              <div className="mt-3 divide-y divide-slate-100 text-xs">
                {ws.reservations.map((r) => (
                  <div key={r.reservationID} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="font-mono text-slate-500">#{r.reservationID}</span>{' '}
                      <strong className="text-slate-900">
                        {r.brandName} {r.modelName} ({r.plate})
                      </strong>
                      <div className="text-slate-500">
                        {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">
                        €{Number(r.totalDue ?? 0).toFixed(2)}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Payments</h3>
              {ws.payments.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">No payments.</p>
              ) : (
                <div className="mt-3 divide-y divide-slate-100 text-xs">
                  {ws.payments.map((p) => (
                    <div key={p.paymentID} className="flex items-center justify-between py-2">
                      <span>
                        {p.receiptNumber} · {p.paymentType} ({p.method})
                      </span>
                      <strong>
                        {Number(p.amount).toFixed(2)} {p.currencyCode}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Invoices</h3>
              {ws.invoices.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">No invoices.</p>
              ) : (
                <div className="mt-3 divide-y divide-slate-100 text-xs">
                  {ws.invoices.map((i) => (
                    <div key={i.invoiceID} className="flex items-center justify-between py-2">
                      <span>
                        {i.invoiceNumber} · {i.invoiceType}
                      </span>
                      <div className="flex items-center gap-2">
                        <strong>
                          {Number(i.total).toFixed(2)} {i.currencyCode}
                        </strong>
                        <StatusBadge status={i.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete client"
        message={`Delete ${c.name} ${c.surname}? Only possible if they have no reservations or documents.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          deleteClientAdmin(id)
            .then(() => {
              showSuccess('Client deleted');
              navigate(ROUTES.CLIENTS);
            })
            .catch((err) => {
              showError(err instanceof ApiError ? err.message : 'Cannot delete client');
              setDeleteOpen(false);
            });
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
