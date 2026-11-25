import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  createCountry,
  deleteCountry,
  fetchCountries,
  updateCountry,
  type CountryRow,
} from './referenceApi';

export function CountriesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<CountryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('countryName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CountryRow | null>(null);
  const [countryName, setCountryName] = useState('');
  const [isoCode, setIsoCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [flagUrl, setFlagUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CountryRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCountries({ page, pageSize: 20, q: q || undefined, sort, order })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load countries'))
      .finally(() => setLoading(false));
  }, [page, q, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setCountryName('');
    setIsoCode('');
    setPhoneCode('');
    setFlagUrl('');
    setModalOpen(true);
  }

  function openEdit(row: CountryRow) {
    setEditing(row);
    setCountryName(row.countryName);
    setIsoCode(row.isoCode ?? '');
    setPhoneCode(row.phoneCode ?? '');
    setFlagUrl(row.flagUrl ?? '');
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        countryName: countryName.trim(),
        isoCode: isoCode.trim().toUpperCase() || null,
        phoneCode: phoneCode.trim() || null,
        flagUrl: flagUrl.trim() || null,
      };
      if (editing) {
        await updateCountry(editing.countryID, payload);
        showSuccess('Country updated');
      } else {
        await createCountry(payload);
        showSuccess('Country created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to save country');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCountry(deleteTarget.countryID);
      showSuccess('Country deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete country');
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<CountryRow>[] = [
    {
      key: 'flag',
      header: 'Flag',
      render: (r) =>
        r.flagUrl ? (
          /^(https?:\/\/|\/)/i.test(r.flagUrl) ? (
            <img src={r.flagUrl} alt={r.countryName} className="h-4 w-6 rounded-xs object-cover" />
          ) : (
            <span className="text-base">{r.flagUrl}</span>
          )
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'countryName',
      header: 'Country',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.countryName}</span>,
      csvValue: (r) => r.countryName,
    },
    {
      key: 'isoCode',
      header: 'ISO',
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-slate-700">{r.isoCode ?? '—'}</span>,
      csvValue: (r) => r.isoCode,
    },
    {
      key: 'phoneCode',
      header: 'Phone Code',
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-slate-700">{r.phoneCode ?? '—'}</span>,
      csvValue: (r) => r.phoneCode,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(r)}
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
          <h1 className="text-2xl font-semibold text-slate-900">Countries</h1>
          <p className="text-sm text-slate-500">Reference countries, ISO codes, phone prefixes, and flags.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add country
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.countryID}
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
        searchPlaceholder="Search country, ISO, or phone code..."
        exportFilename="countries.csv"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? 'Edit country' : 'Add country'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Country name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">ISO code (2 letters)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={isoCode}
                    onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                    placeholder="XK"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Phone code</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="+383"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Flag URL or icon</label>
                <input
                  type="text"
                  maxLength={500}
                  value={flagUrl}
                  onChange={(e) => setFlagUrl(e.target.value)}
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
        title="Delete country"
        message={`Delete "${deleteTarget?.countryName}"? This is blocked if cities or documents reference it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
