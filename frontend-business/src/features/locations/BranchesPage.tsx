import { Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AddressForm } from '../../components/ui/AddressForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  createBranch,
  deleteBranch,
  fetchBranchesAdmin,
  toggleBranchActive,
  updateBranch,
  type AddressInput,
  type BranchAdminRow,
} from '../reference/referenceApi';

const EMPTY_ADDRESS: AddressInput = { street: '', number: '', apt: null, zip: '', cityID: 0 };

export function BranchesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<BranchAdminRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');
  const [sort, setSort] = useState('branchName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BranchAdminRow | null>(null);
  const [branchName, setBranchName] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<BranchAdminRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BranchAdminRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchBranchesAdmin({
      page,
      pageSize: 20,
      q: q || undefined,
      isActive: activeFilter || undefined,
      sort,
      order,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load branches'))
      .finally(() => setLoading(false));
  }, [page, q, activeFilter, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setBranchName('');
    setPhone('');
    setIsActive(true);
    setAddress(EMPTY_ADDRESS);
    setModalOpen(true);
  }

  function openEdit(r: BranchAdminRow) {
    setEditing(r);
    setBranchName(r.branchName);
    setPhone(r.phone ?? '');
    setIsActive(r.isActive === 1);
    setAddress({
      street: r.street,
      number: r.number,
      apt: r.apt,
      zip: r.zip,
      cityID: r.cityID,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { branchName: branchName.trim(), phone: phone.trim() || null, isActive, address };
      if (editing) {
        await updateBranch(editing.branchID, payload);
        showSuccess('Branch updated');
      } else {
        await createBranch(payload);
        showSuccess('Branch created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!deactivateTarget) return;
    const next = deactivateTarget.isActive !== 1;
    try {
      await toggleBranchActive(deactivateTarget.branchID, next);
      showSuccess(next ? 'Branch activated' : 'Branch deactivated');
      setDeactivateTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update branch status');
      setDeactivateTarget(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBranch(deleteTarget.branchID);
      showSuccess('Branch deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete branch');
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<BranchAdminRow>[] = [
    {
      key: 'branchName',
      header: 'Branch',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.branchName}</span>,
      csvValue: (r) => r.branchName,
    },
    {
      key: 'cityName',
      header: 'Location',
      sortable: true,
      render: (r) => (
        <div className="text-xs text-slate-600">
          <div className="font-medium text-slate-800">
            {r.cityName}, {r.countryName}
          </div>
          <div>
            {r.street} {r.number}, {r.zip}
          </div>
        </div>
      ),
      csvValue: (r) => `${r.cityName}, ${r.countryName}`,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => <span className="text-xs text-slate-700">{r.phone ?? '—'}</span>,
      csvValue: (r) => r.phone,
    },
    {
      key: 'carCount',
      header: 'Cars',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.carCount}</span>,
      csvValue: (r) => r.carCount,
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
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => openEdit(r)}
            title="Edit"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeactivateTarget(r)}
            title={r.isActive === 1 ? 'Deactivate' : 'Activate'}
            className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            title="Delete (only if unused)"
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
          <h1 className="text-2xl font-semibold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500">Manage rental branches, addresses, and active status.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add branch
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.branchID}
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
        searchPlaceholder="Search branch or city..."
        filters={
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as '' | 'true' | 'false');
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        }
        exportFilename="branches.csv"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? 'Edit branch' : 'Add branch'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Branch name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Active branch
              </label>

              {!isActive && editing?.isActive === 1 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-800">
                  Deactivating a branch automatically deactivates all of its drop-off locations.
                </div>
              )}

              <AddressForm value={address} onChange={setAddress} />

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
        open={Boolean(deactivateTarget)}
        title={deactivateTarget?.isActive === 1 ? 'Deactivate branch' : 'Activate branch'}
        message={
          deactivateTarget?.isActive === 1
            ? `Deactivate "${deactivateTarget.branchName}"? Its drop-off locations will also be deactivated automatically.`
            : `Activate "${deactivateTarget?.branchName}"?`
        }
        confirmLabel={deactivateTarget?.isActive === 1 ? 'Deactivate' : 'Activate'}
        destructive={deactivateTarget?.isActive === 1}
        onConfirm={handleToggleActive}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete branch"
        message={`Permanently delete "${deleteTarget?.branchName}"? Only possible if unused; otherwise deactivate it.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
