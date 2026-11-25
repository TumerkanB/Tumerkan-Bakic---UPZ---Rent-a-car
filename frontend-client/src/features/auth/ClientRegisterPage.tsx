import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { checkClientAvailability, fetchGeo, type GeoCountry, type GeoResponse } from './clientAuthApi';
import { useClientAuth } from './ClientAuthContext';

type FieldAvailability = 'idle' | 'checking' | 'available' | 'taken';

function isImageUrl(value: string | null): boolean {
  if (!value) return false;
  return /^(https?:\/\/|\/|data:image\/)/i.test(value) || /\.(svg|png|jpe?g|webp)$/i.test(value);
}

function CountryFlag({ flagIcon, countryName }: { flagIcon: string | null; countryName: string }) {
  if (!flagIcon) return null;
  if (isImageUrl(flagIcon)) {
    return <img src={flagIcon} alt={countryName} className="h-4 w-5 shrink-0 rounded-xs object-cover" />;
  }
  return <span className="shrink-0 text-base leading-none">{flagIcon}</span>;
}

function useDebouncedAvailability(
  field: 'email' | 'phone' | 'username',
  value: string,
  isValidFormat: boolean,
): FieldAvailability {
  const [status, setStatus] = useState<FieldAvailability>('idle');

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed || !isValidFormat) {
      setStatus('idle');
      return;
    }

    setStatus('checking');
    let cancelled = false;
    const timer = setTimeout(() => {
      checkClientAvailability({ [field]: trimmed })
        .then((res) => {
          if (cancelled) return;
          const taken =
            field === 'email'
              ? res.emailTaken
              : field === 'phone'
                ? res.phoneTaken
                : res.usernameTaken;
          setStatus(taken ? 'taken' : 'available');
        })
        .catch(() => {
          if (!cancelled) setStatus('idle');
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [field, value, isValidFormat]);

  return status;
}

export function ClientRegisterPage() {
  const { client, register } = useClientAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [geo, setGeo] = useState<GeoResponse | null>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<GeoCountry | null>(null);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryID, setCountryID] = useState('');
  const [cityID, setCityID] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [apt, setApt] = useState('');
  const [zip, setZip] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phonePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (phonePickerRef.current && !phonePickerRef.current.contains(event.target as Node)) {
        setPhoneDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const sortedCountries = useMemo(
    () => [...(geo?.countries ?? [])].sort((a, b) => a.countryName.localeCompare(b.countryName)),
    [geo],
  );

  const phoneCountries = useMemo(() => {
    const withCode = sortedCountries.filter((c) => Boolean(c.phoneCode));
    const base = withCode.length > 0 ? withCode : sortedCountries;
    const q = phoneCountrySearch.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.phoneCode.toLowerCase().includes(q),
    );
  }, [sortedCountries, phoneCountrySearch]);

  const fullPhone = useMemo(() => {
    const num = phoneNumber.trim();
    if (!num) return '';
    return selectedPhoneCountry?.phoneCode ? `${selectedPhoneCountry.phoneCode} ${num}` : num;
  }, [selectedPhoneCountry, phoneNumber]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0]!, []);

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(email.trim());
  const phoneFormatValid = phoneNumber.trim().length >= 6 && fullPhone.length >= 6;
  const usernameFormatValid = username.trim().length >= 3 && !/\s/.test(username.trim());
  const dobValid = Boolean(dateOfBirth && dateOfBirth >= '1900-01-01' && dateOfBirth <= todayStr);

  const emailStatus = useDebouncedAvailability('email', email, emailFormatValid);
  const phoneStatus = useDebouncedAvailability('phone', fullPhone, phoneFormatValid);
  const usernameStatus = useDebouncedAvailability('username', username, usernameFormatValid);

  const canProceedToStepTwo = Boolean(
    name.trim() &&
      surname.trim() &&
      emailFormatValid &&
      phoneFormatValid &&
      dobValid &&
      usernameFormatValid &&
      password.length >= 8 &&
      emailStatus === 'available' &&
      phoneStatus === 'available' &&
      usernameStatus === 'available',
  );

  useEffect(() => {
    fetchGeo()
      .then((data) => {
        const sorted = [...data.countries].sort((a, b) =>
          a.countryName.localeCompare(b.countryName),
        );
        setGeo({ ...data, countries: sorted });

        const usa = sorted.find((c) =>
          /^(usa|us|united states|united states of america)$/i.test(c.countryName.trim()),
        );
        const defaultPhoneCountry =
          usa ?? sorted.find((c) => Boolean(c.phoneCode)) ?? sorted[0] ?? null;

        if (defaultPhoneCountry) {
          setSelectedPhoneCountry(defaultPhoneCountry);
        }
        if (usa) {
          setCountryID(String(usa.countryID));
        } else if (sorted.length === 1 && sorted[0]) {
          setCountryID(String(sorted[0].countryID));
        }
      })
      .catch(() => undefined);
  }, []);

  const filteredCities = useMemo(() => {
    if (!geo) return [];
    if (!countryID) return geo.cities;
    return geo.cities.filter((c) => c.countryID === Number(countryID));
  }, [geo, countryID]);

  if (client) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  function handleStepOneNext(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canProceedToStepTwo) {
      setError('Complete all required fields with valid, available details before continuing.');
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name,
        surname,
        email,
        phone: fullPhone,
        dateOfBirth,
        address: {
          street,
          number,
          apt: apt || undefined,
          zip,
          cityID: Number(cityID),
        },
        username,
        password,
      });
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  }

  function renderAvailabilityHint(status: FieldAvailability, takenMessage: string) {
    if (status === 'checking') {
      return <p className="mt-1 text-xs text-slate-400">Checking availability...</p>;
    }
    if (status === 'taken') {
      return <p className="mt-1 text-xs text-red-600">{takenMessage}</p>;
    }
    if (status === 'available') {
      return <p className="mt-1 text-xs text-emerald-600">Available</p>;
    }
    return null;
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Create a client account</h1>
          <span className="text-xs font-medium text-slate-500">Step {step} of 2</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {step === 1 ? 'Enter your personal and login details.' : 'Enter your residential address.'}
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStepOneNext} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last name</label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  emailStatus === 'taken'
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {renderAvailabilityHint(emailStatus, 'Email is already registered.')}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <div className="flex gap-2">
                  <div ref={phonePickerRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setPhoneDropdownOpen((open) => !open)}
                      className="flex h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-800 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
                    >
                      {selectedPhoneCountry ? (
                        <>
                          <CountryFlag
                            flagIcon={selectedPhoneCountry.flagIcon}
                            countryName={selectedPhoneCountry.countryName}
                          />
                          <span className="font-medium">{selectedPhoneCountry.phoneCode || 'Code'}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Code</span>
                      )}
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {phoneDropdownOpen && (
                      <div className="absolute left-0 z-30 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg">
                        <div className="border-b border-slate-100 p-2">
                          <div className="relative">
                            <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              value={phoneCountrySearch}
                              onChange={(e) => setPhoneCountrySearch(e.target.value)}
                              placeholder="Search country or code..."
                              className="w-full rounded-md border border-slate-200 py-1 pr-2 pl-7 text-xs focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="max-h-52 overflow-y-auto py-1">
                          {phoneCountries.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-500">No matching country</div>
                          ) : (
                            phoneCountries.map((co) => (
                              <button
                                key={co.countryID}
                                type="button"
                                onClick={() => {
                                  setSelectedPhoneCountry(co);
                                  setPhoneDropdownOpen(false);
                                  setPhoneCountrySearch('');
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-slate-50 ${
                                  selectedPhoneCountry?.countryID === co.countryID
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-slate-700'
                                }`}
                              >
                                <CountryFlag flagIcon={co.flagIcon} countryName={co.countryName} />
                                <span className="min-w-0 flex-1 truncate">{co.countryName}</span>
                                {co.phoneCode && (
                                  <span className="shrink-0 font-mono text-xs text-slate-500">{co.phoneCode}</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    required
                    minLength={6}
                    maxLength={35}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="44 123 456"
                    className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                      phoneStatus === 'taken'
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>
                {renderAvailabilityHint(phoneStatus, 'Phone number is already registered.')}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of birth</label>
                <input
                  type="date"
                  required
                  min="1900-01-01"
                  max={todayStr}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    usernameStatus === 'taken'
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {renderAvailabilityHint(usernameStatus, 'Username is already taken.')}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canProceedToStepTwo}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to address
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Country</label>
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Street</label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">No.</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Apt</label>
                <input
                  type="text"
                  maxLength={20}
                  value={apt}
                  onChange={(e) => setApt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">ZIP</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                className="w-1/3 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
