import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  createCity,
  deleteCity,
  fetchAllCountries,
  fetchCities,
  updateCity,
  type CityRow,
  type CountryRow,
} from './referenceApi';

export function CitiesPage() {
  const { showSuccess, showError } = useToast();
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [rows, setRows] = useState<CityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sort, setSort] = useState('cityName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CityRow | null>(null);
  const [cityName, setCityName] = useState('');
  const [countryID, setCountryID] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CityRow | null>(null);

  useEffect(() => {
    fetchAllCountries().then((res) => setCountries(res.data)).catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCities({
      page,
      pageSize: 20,
      q: q || undefined,
      countryID: countryFilter ? Number(countryFilter) : undefined,
      sort,
      order,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load cities'))
      .finally(() => setLoading(false));
  }, [page, q, countryFilter, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCity(editing.cityID, cityName.trim(), Number(countryID));
        showSuccess('City updated');
      } else {
        await createCity(cityName.trim(), Number(countryID));
        showSuccess('City created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to save city');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCity(deleteTarget.cityID);
      showSuccess('City deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete city');
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<CityRow>[] = [
    {
      key: 'cityName',
      header: 'City',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.cityName}</span>,
      csvValue: (r) => r.cityName,
    },
    {
      key: 'countryName',
      header: 'Country',
      sortable: true,
      render: (r) => <span className="text-slate-700">{r.countryName}</span>,
      csvValue: (r) => r.countryName,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(r);
              setCityName(r.cityName);
              setCountryID(String(r.countryID));
              setModalOpen(true);
            }}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cities</h1>
          <p className="text-sm text-slate-500">Cities linked to countries for branches and addresses.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCityName('');
            setCountryID('');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add city
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.cityID}
        loading={loading}
        error={error}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
        sort={sort}
        order={order}
        onSortChange={(k) => {
          if (sort === k) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
          else {
            setSort(k);
            setOrder('asc');
          }
        }}
        search={q}
        onSearchChange={(val) => {
          setQ(val);
          setPage(1);
        }}
        searchPlaceholder="Search city or country..."
        filters={
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All countries</option>
            {countries.map((co) => (
              <option key={co.countryID} value={co.countryID}>
                {co.countryName}
              </option>
            ))}
          </select>
        }
        exportFilename="cities.csv"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? 'Edit city' : 'Add city'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={countryID}
                  onChange={(e) => setCountryID(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select country</option>
                  {countries.map((co) => (
                    <option key={co.countryID} value={co.countryID}>
                      {co.countryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  City name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete city"
        message={`Delete "${deleteTarget?.cityName}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
