import { ArrowRight, Calendar, Globe, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '../../config/constants';
import { fetchPublicLocations, type PublicLocationsResponse } from './catalogApi';

function toLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(10, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 3);

  return {
    start: toLocalDateTimeInput(start),
    end: toLocalDateTimeInput(end),
  };
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaults = useMemo(() => getDefaultDates(), []);

  const [locations, setLocations] = useState<PublicLocationsResponse | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  const [pickupCountryID, setPickupCountryID] = useState(searchParams.get('pickupCountryID') ?? '');
  const [pickupCityID, setPickupCityID] = useState(searchParams.get('pickupCityID') ?? '');
  const [differentDropoff, setDifferentDropoff] = useState(
    Boolean(searchParams.get('dropoffCityID') && searchParams.get('dropoffCityID') !== searchParams.get('pickupCityID')),
  );
  const [dropoffCountryID, setDropoffCountryID] = useState(searchParams.get('dropoffCountryID') ?? '');
  const [dropoffCityID, setDropoffCityID] = useState(searchParams.get('dropoffCityID') ?? '');
  const [crossBorder, setCrossBorder] = useState(searchParams.get('crossBorder') === 'true');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') ?? defaults.start);
  const [endDate, setEndDate] = useState(searchParams.get('endDate') ?? defaults.end);
  const [flexDays, setFlexDays] = useState(searchParams.get('flexDays') ?? '0');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicLocations()
      .then((data) => {
        setLocations(data);
        if (!pickupCountryID && data.pickupCountries.length === 1 && data.pickupCountries[0]) {
          setPickupCountryID(String(data.pickupCountries[0].countryID));
        }
      })
      .catch(() => setLocError('Unable to load branch locations from server.'));
  }, []);

  const pickupCities = useMemo(() => {
    if (!locations) return [];
    if (!pickupCountryID) return locations.pickupCities;
    return locations.pickupCities.filter((c) => c.countryID === Number(pickupCountryID));
  }, [locations, pickupCountryID]);

  const dropoffCities = useMemo(() => {
    if (!locations) return [];
    if (!dropoffCountryID) return locations.dropoffCities;
    return locations.dropoffCities.filter((c) => c.countryID === Number(dropoffCountryID));
  }, [locations, dropoffCountryID]);

  function handlePickupCountryChange(nextCountryId: string) {
    setPickupCountryID(nextCountryId);
    setPickupCityID('');
  }

  function handleDropoffCountryChange(nextCountryId: string) {
    setDropoffCountryID(nextCountryId);
    setDropoffCityID('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setFormError('Please select valid pick-up and return dates.');
      return;
    }
    if (end <= start) {
      setFormError('Return date and time must be after pick-up.');
      return;
    }

    const params = new URLSearchParams();
    if (pickupCountryID) params.set('pickupCountryID', pickupCountryID);
    if (pickupCityID) params.set('pickupCityID', pickupCityID);

    if (differentDropoff) {
      if (dropoffCountryID) params.set('dropoffCountryID', dropoffCountryID);
      if (dropoffCityID) params.set('dropoffCityID', dropoffCityID);
    } else {
      if (pickupCountryID) params.set('dropoffCountryID', pickupCountryID);
      if (pickupCityID) params.set('dropoffCityID', pickupCityID);
    }

    params.set('startDate', startDate);
    params.set('endDate', endDate);
    params.set('flexDays', flexDays);
    if (crossBorder) params.set('crossBorder', 'true');

    navigate(`${ROUTES.RESULTS}?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Vehicle Search</h1>
        <p className="mt-1 text-sm text-slate-600">
          Select your pick-up and return locations and rental period to check availability.
        </p>
      </div>

      {locError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {locError}
        </div>
      )}

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-slate-500" />
            Pick-up location
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pickupCountry" className="mb-1.5 block text-xs font-medium text-slate-700">
                Pick-up country
              </label>
              <select
                id="pickupCountry"
                value={pickupCountryID}
                onChange={(e) => handlePickupCountryChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Any country</option>
                {locations?.pickupCountries.map((co) => (
                  <option key={co.countryID} value={co.countryID}>
                    {co.countryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pickupCity" className="mb-1.5 block text-xs font-medium text-slate-700">
                Pick-up city
              </label>
              <select
                id="pickupCity"
                value={pickupCityID}
                onChange={(e) => setPickupCityID(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Any city</option>
                {pickupCities.map((ci) => (
                  <option key={ci.cityID} value={ci.cityID}>
                    {ci.cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="border-t border-slate-100 pt-4">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={differentDropoff}
              onChange={(e) => setDifferentDropoff(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            Return to a different city or country
          </label>

          {differentDropoff && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dropoffCountry" className="mb-1.5 block text-xs font-medium text-slate-700">
                  Drop-off country
                </label>
                <select
                  id="dropoffCountry"
                  value={dropoffCountryID}
                  onChange={(e) => handleDropoffCountryChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Any country</option>
                  {locations?.dropoffCountries.map((co) => (
                    <option key={co.countryID} value={co.countryID}>
                      {co.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dropoffCity" className="mb-1.5 block text-xs font-medium text-slate-700">
                  Drop-off city
                </label>
                <select
                  id="dropoffCity"
                  value={dropoffCityID}
                  onChange={(e) => setDropoffCityID(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Any city</option>
                  {dropoffCities.map((ci) => (
                    <option key={ci.cityID} value={ci.cityID}>
                      {ci.cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <fieldset className="space-y-4 border-t border-slate-100 pt-4">
          <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Calendar className="h-4 w-4 text-slate-500" />
            Planned rental period
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="startDate" className="mb-1.5 block text-xs font-medium text-slate-700">
                Pick-up date &amp; time
              </label>
              <input
                id="startDate"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="mb-1.5 block text-xs font-medium text-slate-700">
                Return date &amp; time
              </label>
              <input
                id="endDate"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="flexDays" className="mb-1.5 block text-xs font-medium text-slate-700">
                Date flexibility (± days)
              </label>
              <select
                id="flexDays"
                value={flexDays}
                onChange={(e) => setFlexDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="0">Exact dates (0 days)</option>
                <option value="1">± 1 day</option>
                <option value="2">± 2 days</option>
                <option value="3">± 3 days</option>
                <option value="5">± 5 days</option>
                <option value="7">± 7 days</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div className="border-t border-slate-100 pt-4">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={crossBorder}
              onChange={(e) => setCrossBorder(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                <Globe className="h-4 w-4 text-slate-500" />
                I plan to take the vehicle outside the pick-up country
              </span>
              <span className="block text-xs text-slate-500">
                Cross-border travel may require border authorization at pick-up.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Search available vehicles
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
