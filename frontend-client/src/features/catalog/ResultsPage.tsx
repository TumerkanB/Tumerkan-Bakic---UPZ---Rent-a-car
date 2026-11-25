import { Car, Fuel, Globe, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { ROUTES } from '../../config/constants';
import {
  fetchPublicCars,
  fetchPublicFilterOptions,
  fetchPublicLocations,
  type PublicCarItem,
  type PublicFilterOptions,
  type PublicLocationsResponse,
  type SortOption,
} from './catalogApi';

function ManualShiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-slate-400">
      <circle cx="6" cy="6" r="1.5" />
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="18" cy="6" r="1.5" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
      <path d="M6 7.5v9M12 7.5v9M18 7.5v4.5H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AutomaticShiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-slate-400">
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M9.5 16L12 8l2.5 8M10.3 13.5h3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CarCardImage({ car }: { car: PublicCarItem }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const showThumbnail = Boolean(car.thumbnail) && !thumbFailed;
  const fallbackLogo = car.manufacturerLogo ?? car.brandLogo;
  const showLogoFallback = !showThumbnail && Boolean(fallbackLogo) && !logoFailed;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-slate-100 bg-slate-50">
      {showThumbnail ? (
        <img
          src={car.thumbnail!}
          alt={`${car.brandName} ${car.modelName}`}
          onError={() => setThumbFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : showLogoFallback ? (
        <div className="flex h-full w-full items-center justify-center p-8">
          <img
            src={fallbackLogo!}
            alt={car.manufacturerName}
            onError={() => setLogoFailed(true)}
            className="max-h-20 max-w-[140px] object-contain opacity-80"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-300">
          <Car className="h-10 w-10" />
        </div>
      )}

      <span className="absolute top-2.5 left-2.5 rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 backdrop-blur-xs">
        {car.categoryName}
      </span>

      {car.isExactAvailable === 0 && (
        <span className="absolute top-2.5 right-2.5 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
          Flexible dates
        </span>
      )}
    </div>
  );
}

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const [locations, setLocations] = useState<PublicLocationsResponse | null>(null);
  const [filterOptions, setFilterOptions] = useState<PublicFilterOptions | null>(null);
  const [cars, setCars] = useState<PublicCarItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Left-panel trip search state
  const [pickupCountryID, setPickupCountryID] = useState(searchParams.get('pickupCountryID') ?? '');
  const [pickupCityID, setPickupCityID] = useState(searchParams.get('pickupCityID') ?? '');
  const [differentDropoff, setDifferentDropoff] = useState(
    Boolean(
      searchParams.get('dropoffCityID') &&
        searchParams.get('dropoffCityID') !== searchParams.get('pickupCityID'),
    ),
  );
  const [dropoffCountryID, setDropoffCountryID] = useState(searchParams.get('dropoffCountryID') ?? '');
  const [dropoffCityID, setDropoffCityID] = useState(searchParams.get('dropoffCityID') ?? '');
  const [startDate, setStartDate] = useState(startDateParam ?? '');
  const [endDate, setEndDate] = useState(endDateParam ?? '');
  const [flexDays, setFlexDays] = useState(searchParams.get('flexDays') ?? '0');
  const [crossBorder, setCrossBorder] = useState(searchParams.get('crossBorder') === 'true');
  const [panelError, setPanelError] = useState<string | null>(null);

  // Top filter bar state
  const [search, setSearch] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [manufacturerID, setManufacturerID] = useState('');
  const [showMore, setShowMore] = useState(false);

  // "More" filters state
  const [brandID, setBrandID] = useState('');
  const [branchID, setBranchID] = useState('');
  const [color, setColor] = useState('');
  const [minDailyRate, setMinDailyRate] = useState('');
  const [maxDailyRate, setMaxDailyRate] = useState('');
  const [maxMileage, setMaxMileage] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  useEffect(() => {
    Promise.all([fetchPublicLocations(), fetchPublicFilterOptions()])
      .then(([locRes, optRes]) => {
        setLocations(locRes);
        setFilterOptions(optRes);
      })
      .catch(() => undefined);
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

  const activeMoreCount = useMemo(() => {
    let count = 0;
    if (brandID) count++;
    if (branchID) count++;
    if (color) count++;
    if (minDailyRate) count++;
    if (maxDailyRate) count++;
    if (maxMileage) count++;
    if (sortBy !== 'price_asc') count++;
    return count;
  }, [brandID, branchID, color, minDailyRate, maxDailyRate, maxMileage, sortBy]);

  useEffect(() => {
    if (!startDateParam || !endDateParam) return;
    let active = true;
    setLoading(true);
    setError(null);

    fetchPublicCars({
      pickupCountryID: searchParams.get('pickupCountryID') ? Number(searchParams.get('pickupCountryID')) : undefined,
      pickupCityID: searchParams.get('pickupCityID') ? Number(searchParams.get('pickupCityID')) : undefined,
      dropoffCountryID: searchParams.get('dropoffCountryID') ? Number(searchParams.get('dropoffCountryID')) : undefined,
      dropoffCityID: searchParams.get('dropoffCityID') ? Number(searchParams.get('dropoffCityID')) : undefined,
      startDate: startDateParam,
      endDate: endDateParam,
      flexDays: Number(searchParams.get('flexDays') ?? '0'),
      crossBorder: searchParams.get('crossBorder') === 'true',
      categoryID: categoryID ? Number(categoryID) : undefined,
      manufacturerID: manufacturerID ? Number(manufacturerID) : undefined,
      brandID: brandID ? Number(brandID) : undefined,
      branchID: branchID ? Number(branchID) : undefined,
      fuelType: fuelType || undefined,
      transmission: transmission || undefined,
      color: color || undefined,
      minDailyRate: minDailyRate ? Number(minDailyRate) : undefined,
      maxDailyRate: maxDailyRate ? Number(maxDailyRate) : undefined,
      maxMileage: maxMileage ? Number(maxMileage) : undefined,
      sortBy,
      search: search || undefined,
    })
      .then((res) => {
        if (active) {
          setCars(res.items);
          setTotalResults(res.pagination.total);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load search results');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    searchParams,
    startDateParam,
    endDateParam,
    categoryID,
    manufacturerID,
    brandID,
    branchID,
    fuelType,
    transmission,
    color,
    minDailyRate,
    maxDailyRate,
    maxMileage,
    sortBy,
    search,
  ]);

  if (!startDateParam || !endDateParam) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  function handleSearchUpdate(e: FormEvent) {
    e.preventDefault();
    setPanelError(null);

    const s = new Date(startDate);
    const en = new Date(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(en.getTime())) {
      setPanelError('Please enter valid dates.');
      return;
    }
    if (en <= s) {
      setPanelError('Return date must be after pick-up.');
      return;
    }

    const next = new URLSearchParams();
    if (pickupCountryID) next.set('pickupCountryID', pickupCountryID);
    if (pickupCityID) next.set('pickupCityID', pickupCityID);
    if (differentDropoff) {
      if (dropoffCountryID) next.set('dropoffCountryID', dropoffCountryID);
      if (dropoffCityID) next.set('dropoffCityID', dropoffCityID);
    } else {
      if (pickupCountryID) next.set('dropoffCountryID', pickupCountryID);
      if (pickupCityID) next.set('dropoffCityID', pickupCityID);
    }
    next.set('startDate', startDate);
    next.set('endDate', endDate);
    next.set('flexDays', flexDays);
    if (crossBorder) next.set('crossBorder', 'true');

    setSearchParams(next);
  }

  function clearVehicleFilters() {
    setSearch('');
    setCategoryID('');
    setFuelType('');
    setTransmission('');
    setManufacturerID('');
    setBrandID('');
    setBranchID('');
    setColor('');
    setMinDailyRate('');
    setMaxDailyRate('');
    setMaxMileage('');
    setSortBy('price_asc');
  }

  const hasAnyVehicleFilter = Boolean(
    search || categoryID || fuelType || transmission || manufacturerID || activeMoreCount > 0,
  );

  return (
    <div className="ml-0 flex flex-col gap-6 py-6 pr-4 pl-0 sm:pr-6 lg:flex-row lg:items-start">
      {/* Left: Searched Trip Panel */}
      <aside className="ml-0 w-full shrink-0 border border-l-0 border-slate-200 bg-white p-5 lg:sticky lg:top-20 lg:w-76 lg:rounded-r-xl">
        <h2 className="text-sm font-semibold text-slate-900">Your search</h2>

        {panelError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {panelError}
          </div>
        )}

        <form onSubmit={handleSearchUpdate} className="mt-4 space-y-4">
          <div className="space-y-2.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up country</label>
              <select
                value={pickupCountryID}
                onChange={(e) => {
                  setPickupCountryID(e.target.value);
                  setPickupCityID('');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
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
              <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up city</label>
              <select
                value={pickupCityID}
                onChange={(e) => setPickupCityID(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
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

          <div className="border-t border-slate-100 pt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={differentDropoff}
                onChange={(e) => setDifferentDropoff(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
              />
              Different drop-off location
            </label>

            {differentDropoff && (
              <div className="mt-2.5 space-y-2.5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Drop-off country</label>
                  <select
                    value={dropoffCountryID}
                    onChange={(e) => {
                      setDropoffCountryID(e.target.value);
                      setDropoffCityID('');
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
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
                  <label className="mb-1 block text-xs font-medium text-slate-700">Drop-off city</label>
                  <select
                    value={dropoffCityID}
                    onChange={(e) => setDropoffCityID(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
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

          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Pick-up date &amp; time</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Return date &amp; time</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Flexibility (± days)</label>
              <select
                value={flexDays}
                onChange={(e) => setFlexDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
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

          <div className="border-t border-slate-100 pt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={crossBorder}
                onChange={(e) => setCrossBorder(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
              />
              <Globe className="h-3.5 w-3.5 text-slate-500" />
              Outside pick-up country
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Update search
          </button>
        </form>
      </aside>

      {/* Right: Top Filters + Results */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Top Filter Bar */}
        <div className="sticky top-16 z-30 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brand or model..."
                className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={categoryID}
              onChange={(e) => setCategoryID(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">All categories</option>
              {filterOptions?.categories.map((c) => (
                <option key={c.categoryID} value={c.categoryID}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">All fuel types</option>
              {(filterOptions?.fuelTypes ?? ['Gas', 'Diesel', 'Electric', 'Hybrid']).map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>

            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">All transmissions</option>
              {(filterOptions?.transmissions ?? ['Manual', 'Automatic']).map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMore((prev) => !prev)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  showMore || activeMoreCount > 0
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                More
                {activeMoreCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                    {activeMoreCount}
                  </span>
                )}
              </button>

              {hasAnyVehicleFilter && (
                <button
                  type="button"
                  onClick={clearVehicleFilters}
                  title="Clear filters"
                  className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Manufacturer Logo Filter Strip */}
          {filterOptions && filterOptions.manufacturers.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-3">
              <span className="shrink-0 text-xs font-medium text-slate-500">Manufacturer:</span>
              <button
                type="button"
                onClick={() => setManufacturerID('')}
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  manufacturerID === ''
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {filterOptions.manufacturers.map((m) => {
                const selected = manufacturerID === String(m.manufacturerID);
                return (
                  <button
                    key={m.manufacturerID}
                    type="button"
                    onClick={() =>
                      setManufacturerID(selected ? '' : String(m.manufacturerID))
                    }
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.logoUrl && (
                      <img
                        src={m.logoUrl}
                        alt={m.manufacturerName}
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span>{m.manufacturerName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Expandable "More" filters */}
          {showMore && (
            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Brand</label>
                <select
                  value={brandID}
                  onChange={(e) => setBrandID(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All brands</option>
                  {filterOptions?.brands.map((b) => (
                    <option key={b.brandID} value={b.brandID}>
                      {b.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Pick-up branch</label>
                <select
                  value={branchID}
                  onChange={(e) => setBranchID(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="">All branches</option>
                  {filterOptions?.branches.map((br) => (
                    <option key={br.branchID} value={br.branchID}>
                      {br.branchName} ({br.cityName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Color</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Any color</option>
                  {filterOptions?.colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                >
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="mileage_asc">Lowest mileage</option>
                  <option value="newest">Newest added</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Min daily rate (€)</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={minDailyRate}
                  onChange={(e) => setMinDailyRate(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Max daily rate (€)</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={maxDailyRate}
                  onChange={(e) => setMaxDailyRate(e.target.value)}
                  placeholder="Any"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Max mileage (km)</label>
                <input
                  type="number"
                  min={0}
                  step="5000"
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(e.target.value)}
                  placeholder="Any"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status / Count line */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {loading ? 'Searching...' : `${totalResults} vehicle${totalResults === 1 ? '' : 's'} available`}
          </span>
          {searchParams.get('crossBorder') === 'true' && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
              <Globe className="h-3 w-3" />
              Cross-border travel selected
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
            Checking vehicle availability...
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Car className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No vehicles available for these criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or widening the ± days flexibility.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car) => {
              const headerLogo = car.manufacturerLogo ?? car.brandLogo;
              return (
                <div
                  key={car.carID}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <CarCardImage car={car} />

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {headerLogo && (
                            <img
                              src={headerLogo}
                              alt={car.manufacturerName}
                              className="h-4 w-4 shrink-0 object-contain"
                            />
                          )}
                          <span className="truncate text-xs text-slate-500">{car.manufacturerName}</span>
                        </div>
                        <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
                          {car.brandName} {car.modelName}
                        </h3>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-base font-semibold text-slate-900">
                          {car.periodTotalPrice !== null
                            ? `€${car.periodTotalPrice.toFixed(2)}`
                            : car.dailyRate !== null
                              ? `€${car.dailyRate.toFixed(2)}/day`
                              : '—'}
                        </div>
                        {car.periodTotalPrice !== null && car.dailyRate !== null && (
                          <div className="text-xs text-slate-500">€{car.dailyRate.toFixed(2)} / day</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          {car.transmission === 'Automatic' ? (
                            <AutomaticShiftIcon />
                          ) : (
                            <ManualShiftIcon />
                          )}
                          <span>{car.transmission}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5 text-slate-400" />
                          <span>{car.fuelType}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {car.branchName} · {car.pickupCityName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
