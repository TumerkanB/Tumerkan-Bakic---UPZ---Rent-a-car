import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createCity,
  fetchAllCities,
  fetchAllCountries,
  type AddressInput,
  type CityRow,
  type CountryRow,
} from '../../features/reference/referenceApi';
import { ApiError } from '../../lib/apiClient';
import { useToast } from './ToastContext';

interface AddressFormProps {
  value: AddressInput;
  onChange: (next: AddressInput) => void;
  allowedCityId?: number;
}

export function AddressForm({ value, onChange, allowedCityId }: AddressFormProps) {
  const { showSuccess, showError } = useToast();
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [addingCity, setAddingCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  useEffect(() => {
    Promise.all([fetchAllCountries(), fetchAllCities()])
      .then(([co, ci]) => {
        setCountries(co.data);
        setCities(ci.data);
        if (value.cityID) {
          const match = ci.data.find((c) => c.cityID === value.cityID);
          if (match) setSelectedCountryId(String(match.countryID));
        }
      })
      .catch(() => undefined);
  }, [value.cityID]);

  const visibleCities = useMemo(() => {
    let list = cities;
    if (allowedCityId) {
      list = list.filter((c) => c.cityID === allowedCityId);
    } else if (selectedCountryId) {
      list = list.filter((c) => c.countryID === Number(selectedCountryId));
    }
    return list;
  }, [cities, selectedCountryId, allowedCityId]);

  async function handleQuickAddCity() {
    if (!newCityName.trim() || !selectedCountryId) return;
    try {
      const res = await createCity(newCityName.trim(), Number(selectedCountryId));
      const all = await fetchAllCities();
      setCities(all.data);
      onChange({ ...value, cityID: res.city.cityID });
      setNewCityName('');
      setAddingCity(false);
      showSuccess('City added');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Unable to add city');
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!allowedCityId && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Country</label>
            <select
              value={selectedCountryId}
              onChange={(e) => {
                setSelectedCountryId(e.target.value);
                onChange({ ...value, cityID: 0 });
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">All countries</option>
              {countries.map((co) => (
                <option key={co.countryID} value={co.countryID}>
                  {co.countryName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={allowedCityId ? 'sm:col-span-2' : ''}>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700">
              City <span className="text-red-500">*</span>
            </label>
            {!allowedCityId && selectedCountryId && (
              <button
                type="button"
                onClick={() => setAddingCity((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-3 w-3" />
                Add city
              </button>
            )}
          </div>
          <select
            required
            value={value.cityID || ''}
            onChange={(e) => onChange({ ...value, cityID: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select city</option>
            {visibleCities.map((ci) => (
              <option key={ci.cityID} value={ci.cityID}>
                {ci.cityName} ({ci.countryName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {addingCity && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            placeholder="New city name..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={handleQuickAddCity}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Save city
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Street <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-slate-700">
            No. <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={20}
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-slate-700">Apt</label>
          <input
            type="text"
            maxLength={20}
            value={value.apt ?? ''}
            onChange={(e) => onChange({ ...value, apt: e.target.value || null })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs font-medium text-slate-700">
            ZIP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={20}
            value={value.zip}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
