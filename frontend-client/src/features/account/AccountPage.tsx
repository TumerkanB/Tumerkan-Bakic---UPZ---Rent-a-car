import { Calendar, CheckCircle2, Clock, CreditCard, LogOut, Search, Settings, Shield, User, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router';
import { ROUTES, STORAGE_KEYS } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { checkClientAvailability, fetchGeo, type GeoResponse } from '../auth/clientAuthApi';
import { useClientAuth } from '../auth/ClientAuthContext';
import {
  changeClientPassword,
  fetchAccountOverview,
  updateClientProfile,
  updateClientUsername,
  type AccountOverviewResponse,
} from './clientAccountApi';

type AccountTab = 'reservations' | 'profile' | 'documents' | 'security' | 'settings';

interface ClientPreferences {
  distanceUnit: 'km' | 'mi';
  timeFormat: '24h' | '12h';
  bookingEmails: boolean;
}

function loadPreferences(): ClientPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_PREFS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ClientPreferences>;
      return {
        distanceUnit: parsed.distanceUnit === 'mi' ? 'mi' : 'km',
        timeFormat: parsed.timeFormat === '12h' ? '12h' : '24h',
        bookingEmails: parsed.bookingEmails ?? true,
      };
    }
  } catch {
    // ignore invalid JSON
  }
  return { distanceUnit: 'km', timeFormat: '24h', bookingEmails: true };
}

const RESERVATION_STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Active: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AccountPage() {
  const { client, isLoading, setSession, logout } = useClientAuth();

  const [tab, setTab] = useState<AccountTab>('profile');
  const [data, setData] = useState<AccountOverviewResponse | null>(null);
  const [geo, setGeo] = useState<GeoResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Profile & address form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryID, setCountryID] = useState('');
  const [cityID, setCityID] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [apt, setApt] = useState('');
  const [zip, setZip] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Reservations filter state
  const [resSearch, setResSearch] = useState('');
  const [resStatus, setResStatus] = useState('');
  const [resPaymentStatus, setResPaymentStatus] = useState('');
  const [resSort, setResSort] = useState<'newest' | 'oldest'>('newest');

  // Security: username form
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [usernameCheck, setUsernameCheck] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  // Settings preferences state
  const [prefs, setPrefs] = useState<ClientPreferences>(() => loadPreferences());
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Security: password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoadingData(true);
    setLoadError(null);

    Promise.all([fetchAccountOverview(), fetchGeo()])
      .then(([overview, geoData]) => {
        setData(overview);
        setGeo(geoData);

        const p = overview.profile;
        setEmail(p.email);
        setPhone(p.phone ?? '');
        setCountryID(p.countryID ? String(p.countryID) : '');
        setCityID(p.cityID ? String(p.cityID) : '');
        setStreet(p.street ?? '');
        setNumber(p.number ?? '');
        setApt(p.apt ?? '');
        setZip(p.zip ?? '');
        setNewUsername(p.username);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : 'Unable to load account details');
      })
      .finally(() => setLoadingData(false));
  }, [client?.clientID]);

  // Live username availability check when changing username
  useEffect(() => {
    const trimmed = newUsername.trim();
    if (!data || !trimmed || trimmed === data.profile.username || trimmed.length < 3 || /\s/.test(trimmed)) {
      setUsernameCheck('idle');
      return;
    }

    setUsernameCheck('checking');
    let cancelled = false;
    const timer = setTimeout(() => {
      checkClientAvailability({ username: trimmed })
        .then((res) => {
          if (!cancelled) setUsernameCheck(res.usernameTaken ? 'taken' : 'available');
        })
        .catch(() => {
          if (!cancelled) setUsernameCheck('idle');
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [newUsername, data]);

  const filteredCities = useMemo(() => {
    if (!geo) return [];
    if (!countryID) return geo.cities;
    return geo.cities.filter((c) => c.countryID === Number(countryID));
  }, [geo, countryID]);

  const filteredReservations = useMemo(() => {
    const list = data?.reservations ?? [];
    const q = resSearch.trim().toLowerCase();

    const filtered = list.filter((r) => {
      if (resStatus && r.status !== resStatus) return false;
      if (resPaymentStatus && r.paymentStatus !== resPaymentStatus) return false;
      if (q) {
        const hay = `${r.reservationID} ${r.brandName} ${r.modelName} ${r.plate} ${r.pickupBranch} ${r.dropoffPlace}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const ta = new Date(a.startDate).getTime();
      const tb = new Date(b.startDate).getTime();
      return resSort === 'newest' ? tb - ta : ta - tb;
    });
  }, [data?.reservations, resSearch, resStatus, resPaymentStatus, resSort]);

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading account...</div>;
  }

  if (!client) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const res = await updateClientProfile({
        email,
        phone,
        address: {
          street,
          number,
          apt: apt || undefined,
          zip,
          cityID: Number(cityID),
        },
      });
      setSession(res.token, res.client);
      const refreshed = await fetchAccountOverview();
      setData(refreshed);
      setProfileMsg({ type: 'ok', text: 'Profile and address updated.' });
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setUsernameMsg(null);
    setSavingUsername(true);
    try {
      const res = await updateClientUsername(newUsername.trim(), usernamePassword);
      setSession(res.token, res.client);
      setData((prev) => (prev ? { ...prev, profile: { ...prev.profile, username: res.client.username } } : prev));
      setUsernamePassword('');
      setUsernameCheck('idle');
      setUsernameMsg({ type: 'ok', text: 'Username updated.' });
    } catch (err) {
      setUsernameMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Failed to update username' });
    } finally {
      setSavingUsername(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    setSavingPassword(true);
    try {
      await changeClientPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'ok', text: 'Password updated.' });
    } catch (err) {
      setPasswordMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  }

  const tabs: { id: AccountTab; label: string; icon: typeof Calendar }[] = [
    { id: 'profile', label: 'Profile & Address', icon: User },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'documents', label: 'Documents & Payments', icon: CreditCard },
    { id: 'security', label: 'Username & Password', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  function handleSavePreferences(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.CLIENT_PREFS, JSON.stringify(prefs));
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  }

  return (
    <div className="ml-0 flex flex-col gap-6 py-6 pr-4 pl-0 sm:pr-6 lg:flex-row lg:items-start">
      {/* Left: Account Navigation Menu */}
      <aside className="ml-0 w-full shrink-0 border border-l-0 border-slate-200 bg-white p-3 lg:sticky lg:top-20 lg:w-64 lg:rounded-r-xl">
        <div className="mb-2 px-3 py-1.5">
          <div className="truncate text-sm font-semibold text-slate-900">
            {client.name} {client.surname}
          </div>
          <div className="truncate text-xs text-slate-500">@{client.username}</div>
        </div>

        <nav className="space-y-1 border-t border-slate-100 pt-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right: Summary Header & Active Tab Content */}
      <div className="min-w-0 flex-1 space-y-6 pl-4 lg:pl-0">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {client.name} {client.surname}
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                @{client.username} · {client.email}
              </p>
            </div>

            {data && (
              <div className="flex flex-wrap gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-right">
                  <div className="text-xs text-slate-500">Completed rentals</div>
                  <div className="text-base font-semibold text-slate-900">{data.summary.totalRentals}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-right">
                  <div className="text-xs text-slate-500">Lifetime spend</div>
                  <div className="text-base font-semibold text-slate-900">
                    €{Number(data.summary.lifetimeSpend).toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-right">
                  <div className="text-xs text-slate-500">Loyalty discount</div>
                  <div className="text-base font-semibold text-slate-900">
                    {data.summary.loyaltyDiscountPercent}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {data?.profile.lastLoginAt && (
            <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Last login: {formatDateTime(data.profile.lastLoginAt)}
            </div>
          )}
        </div>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
      )}

      {loadingData ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
          Loading account data...
        </div>
      ) : !data ? null : (
        <>
          {/* Tab 1: Reservations */}
          {tab === 'reservations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Search #, car, plate, branch..."
                    className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <select
                  value={resStatus}
                  onChange={(e) => setResStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={resPaymentStatus}
                  onChange={(e) => setResPaymentStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All payment statuses</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                  <option value="Overpaid">Overpaid</option>
                  <option value="NoCharge">NoCharge</option>
                </select>

                <div className="flex items-center gap-2">
                  <select
                    value={resSort}
                    onChange={(e) => setResSort(e.target.value as 'newest' | 'oldest')}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>

                  {(resSearch || resStatus || resPaymentStatus || resSort !== 'newest') && (
                    <button
                      type="button"
                      onClick={() => {
                        setResSearch('');
                        setResStatus('');
                        setResPaymentStatus('');
                        setResSort('newest');
                      }}
                      title="Clear filters"
                      className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {filteredReservations.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  {data.reservations.length === 0
                    ? 'You have no reservations yet.'
                    : 'No reservations match your filters.'}
                </div>
              ) : (
                filteredReservations.map((r) => (
                  <div
                    key={r.reservationID}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">#{r.reservationID}</span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            RESERVATION_STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.paymentStatus && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {r.paymentStatus}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {r.brandName} {r.modelName}{' '}
                        <span className="font-mono text-xs font-normal text-slate-500">({r.plate})</span>
                      </h3>
                      <p className="text-xs text-slate-600">
                        {r.pickupBranch} → {r.dropoffPlace}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(r.startDate)} – {formatDateTime(r.endDate)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-right sm:flex-col sm:gap-1">
                      <div>
                        <div className="text-xs text-slate-500">Total due</div>
                        <div className="text-base font-semibold text-slate-900">
                          €{Number(r.totalDue ?? r.totalPrice ?? 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Paid: €{Number(r.paid ?? 0).toFixed(2)} · Balance: €{Number(r.balance ?? 0).toFixed(2)}
                      </div>
                      {Number(r.depositHeld ?? 0) > 0 && (
                        <div className="text-xs text-amber-700">
                          Deposit held: €{Number(r.depositHeld).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Profile & Address */}
          {tab === 'profile' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Account details</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Full name</dt>
                    <dd className="font-medium text-slate-900">
                      {data.profile.name} {data.profile.surname}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Date of birth</dt>
                    <dd className="font-medium text-slate-900">{data.profile.dateOfBirth ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Member since</dt>
                    <dd className="font-medium text-slate-900">{formatDateTime(data.profile.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
              >
                <h2 className="text-sm font-semibold text-slate-900">Contact &amp; address</h2>

                {profileMsg && (
                  <div
                    className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                      profileMsg.type === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
                    <input
                      type="tel"
                      required
                      minLength={6}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Country</label>
                    <select
                      required
                      value={countryID}
                      onChange={(e) => {
                        setCountryID(e.target.value);
                        setCityID('');
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select country</option>
                      {geo?.countries.map((co) => (
                        <option key={co.countryID} value={co.countryID}>
                          {co.countryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">City</label>
                    <select
                      required
                      value={cityID}
                      onChange={(e) => setCityID(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select city</option>
                      {filteredCities.map((ci) => (
                        <option key={ci.cityID} value={ci.cityID}>
                          {ci.cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">Street</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-700">No.</label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-700">Apt</label>
                    <input
                      type="text"
                      value={apt}
                      onChange={(e) => setApt(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-1 block text-xs font-medium text-slate-700">ZIP</label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Documents & Payments */}
          {tab === 'documents' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Identity &amp; driving licence verification</h2>
                {data.verifications.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No verification documents on file.</p>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100">
                    {data.verifications.map((v) => (
                      <div key={v.verificationID} className="flex items-center justify-between py-3 text-sm">
                        <div>
                          <div className="font-medium text-slate-900">
                            {v.documentType} · <span className="font-mono text-xs">{v.documentID}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {v.documentCountry ?? '—'}
                            {v.expiryDate ? ` · Expires ${v.expiryDate}` : ''}
                          </div>
                        </div>
                        {v.isVerified === 1 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Pending verification
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Payment &amp; deposit history</h2>
                {data.payments.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No payments recorded yet.</p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="text-xs font-medium uppercase text-slate-500">
                        <tr>
                          <th className="py-2 pr-4">Receipt</th>
                          <th className="py-2 pr-4">Reservation</th>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Method</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.payments.map((p) => (
                          <tr key={p.paymentID}>
                            <td className="py-2.5 pr-4 font-mono text-xs text-slate-700">{p.receiptNumber}</td>
                            <td className="py-2.5 pr-4 font-mono text-xs text-slate-600">#{p.reservationID}</td>
                            <td className="py-2.5 pr-4 text-slate-700">{p.paymentType}</td>
                            <td className="py-2.5 pr-4 text-slate-700">{p.method}</td>
                            <td className="py-2.5 pr-4 font-medium text-slate-900">
                              {Number(p.amount).toFixed(2)} {p.currencyCode}
                            </td>
                            <td className="py-2.5 text-xs text-slate-500">{formatDateTime(p.paidAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Username & Password */}
          {tab === 'security' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <form onSubmit={handleUsernameSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Change username</h2>

                {usernameMsg && (
                  <div
                    className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                      usernameMsg.type === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {usernameMsg.text}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">New username</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {usernameCheck === 'checking' && (
                    <p className="mt-1 text-xs text-slate-400">Checking availability...</p>
                  )}
                  {usernameCheck === 'taken' && (
                    <p className="mt-1 text-xs text-red-600">Username is already taken.</p>
                  )}
                  {usernameCheck === 'available' && (
                    <p className="mt-1 text-xs text-emerald-600">Username is available.</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Current password</label>
                  <input
                    type="password"
                    required
                    value={usernamePassword}
                    onChange={(e) => setUsernamePassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    savingUsername ||
                    newUsername.trim() === data.profile.username ||
                    usernameCheck === 'taken' ||
                    usernameCheck === 'checking'
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingUsername ? 'Updating...' : 'Update username'}
                </button>
              </form>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Change password</h2>

                {passwordMsg && (
                  <div
                    className={`rounded-lg border px-3.5 py-2.5 text-sm ${
                      passwordMsg.type === 'ok'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Current password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">New password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Confirm new password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>
          )}

          {/* Tab 5: Settings */}
          {tab === 'settings' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <form
                onSubmit={handleSavePreferences}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
              >
                <h2 className="text-sm font-semibold text-slate-900">Preferences</h2>

                {prefsSaved && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
                    Settings saved.
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Distance unit</label>
                  <select
                    value={prefs.distanceUnit}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, distanceUnit: e.target.value === 'mi' ? 'mi' : 'km' }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Time format</label>
                  <select
                    value={prefs.timeFormat}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, timeFormat: e.target.value === '12h' ? '12h' : '24h' }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour (AM/PM)</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={prefs.bookingEmails}
                    onChange={(e) => setPrefs((p) => ({ ...p, bookingEmails: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  Receive booking and return reminder emails
                </label>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save preferences
                </button>
              </form>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-sm font-semibold text-slate-900">Session</h2>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Signed in as</dt>
                    <dd className="font-medium text-slate-900">@{data.profile.username}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Last login</dt>
                    <dd className="text-slate-700">{formatDateTime(data.profile.lastLoginAt)}</dd>
                  </div>
                </dl>
                <div className="border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
