import { Eye, Lock, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AddressForm } from '../../components/ui/AddressForm';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import type { AddressInput } from '../reference/referenceApi';
import { createClientAdmin, fetchClients, type ClientListRow } from './clientsApi';

const EMPTY_ADDRESS: AddressInput = { street: '', number: '', apt: null, zip: '', cityID: 0 };

export function ClientsPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<ClientListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('');
  const [verifiedLicence, setVerifiedLicence] = useState<'' | 'true' | 'false'>('');
  const [locked, setLocked] = useState<'' | 'true' | 'false'>('');
  const [sort, setSort] = useState('clientID');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [includeAddress, setIncludeAddress] = useState(false);
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchClients({
      page,
      pageSize: 20,
      q: q || undefined,
      isActive: isActive || undefined,
      verifiedLicence: verifiedLicence || undefined,
      locked: locked || undefined,
      sort,
      order,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load clients'))
      .finally(() => setLoading(false));
  }, [page, q, isActive, verifiedLicence, locked, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createClientAdmin({
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        dateOfBirth: dateOfBirth || null,
        isActive: true,
        address: includeAddress && address.cityID > 0 ? address : null,
      });
      showSuccess('Client created');
      setModalOpen(false);
      setName('');
      setSurname('');
      setEmail('');
      setPhone('');
      setDateOfBirth('');
      setIncludeAddress(false);
      setAddress(EMPTY_ADDRESS);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to create client');
    } finally {
      setSaving(false);
    }
  }

  const columns: ColumnDef<ClientListRow>[] = [
    {
      key: 'name',
      header: 'Client',
      sortable: true,
      render: (r) => (
        <div>
          <div className="flex items-center gap-1.5 font-medium text-slate-900">
            <span>
              {r.name} {r.surname}
            </span>
            {r.lockedUntil && new Date(r.lockedUntil) > new Date() && (
              <span title="Locked" className="text-red-500">
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">{r.username ? `@${r.username}` : 'No web login'}</div>
        </div>
      ),
      csvValue: (r) => `${r.name} ${r.surname}`,
    },
    {
      key: 'email',
      header: 'Email & Phone',
      sortable: true,
      render: (r) => (
        <div className="text-xs text-slate-600">
          <div>{r.email}</div>
          <div>{r.phone ?? '—'}</div>
        </div>
      ),
      csvValue: (r) => r.email,
    },
    {
      key: 'cityName',
      header: 'City',
      sortable: true,
      render: (r) => <span className="text-xs text-slate-700">{r.cityName ?? '—'}</span>,
      csvValue: (r) => r.cityName,
    },
    {
      key: 'totalRentals',
      header: 'Rentals',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.totalRentals}</span>,
      csvValue: (r) => r.totalRentals,
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : '—'}
        </span>
      ),
      csvValue: (r) => r.lastLoginAt,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (r) => <StatusBadge status={r.isActive === 1 ? 'Active' : 'Inactive'} />,
      csvValue: (r) => (r.isActive === 1 ? 'Active' : 'Inactive'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Link
          to={`/clients/${r.clientID}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" />
          Manage
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">Customer profiles, driver verifications, credentials, and rental history.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add client
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.clientID}
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
        searchPlaceholder="Search name, email, username, phone..."
        exportFilename="clients.csv"
        filters={
          <>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value as '' | 'true' | 'false');
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={verifiedLicence}
              onChange={(e) => {
                setVerifiedLicence(e.target.value as '' | 'true' | 'false');
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">Any licence status</option>
              <option value="true">Verified licence</option>
              <option value="false">No verified licence</option>
            </select>
            <select
              value={locked}
              onChange={(e) => {
                setLocked(e.target.value as '' | 'true' | 'false');
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">Any lock state</option>
              <option value="true">Locked only</option>
              <option value="false">Unlocked</option>
            </select>
          </>
        }
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">New client</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
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
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeAddress}
                  onChange={(e) => setIncludeAddress(e.target.checked)}
                />
                Include residential address
              </label>

              {includeAddress && <AddressForm value={address} onChange={setAddress} />}

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
                  {saving ? 'Saving...' : 'Create client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
