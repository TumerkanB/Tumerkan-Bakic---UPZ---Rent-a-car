import { Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AddressForm } from '../../components/ui/AddressForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  createDropoff,
  deleteDropoff,
  fetchBranchesAdmin,
  fetchDropoffsAdmin,
  toggleDropoffActive,
  updateDropoff,
  type AddressInput,
  type BranchAdminRow,
  type DropoffAdminRow,
} from '../reference/referenceApi';

const EMPTY_ADDRESS: AddressInput = { street: '', number: '', apt: null, zip: '', cityID: 0 };

export function DropoffsPage() {
  const { showSuccess, showError } = useToast();
  const [branches, setBranches] = useState<BranchAdminRow[]>([]);
  const [rows, setRows] = useState<DropoffAdminRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [sort, setSort] = useState('locationName');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DropoffAdminRow | null>(null);
  const [locationName, setLocationName] = useState('');
  const [branchID, setBranchID] = useState('');
  const [dropoffFee, setDropoffFee] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  const [deactivateTarget, setDeactivateTarget] = useState<DropoffAdminRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DropoffAdminRow | null>(null);

  useEffect(() => {
    fetchBranchesAdmin({ page: 1, pageSize: 100, sort: 'branchName', order: 'asc' })
      .then((res) => setBranches(res.data))
      .catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchDropoffsAdmin({
      page,
      pageSize: 20,
      q: q || undefined,
      branchID: branchFilter ? Number(branchFilter) : undefined,
      sort,
      order,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load drop-off locations'))
      .finally(() => setLoading(false));
  }, [page, q, branchFilter, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedBranch = branches.find((b) => b.branchID === Number(branchID));

  function openCreate() {
    setEditing(null);
    setLocationName('');
    setBranchID('');
    setDropoffFee('0');
    setIsActive(true);
    setAddress(EMPTY_ADDRESS);
    setModalOpen(true);
  }

  function openEdit(r: DropoffAdminRow) {
    setEditing(r);
    setLocationName(r.locationName);
    setBranchID(String(r.branchID));
    setDropoffFee(String(r.dropoffFee));
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
      const payload = {
        locationName: locationName.trim(),
        branchID: Number(branchID),
        dropoffFee: Number(dropoffFee),
        isActive,
        address,
      };
      if (editing) {
        await updateDropoff(editing.locationID, payload);
        showSuccess('Drop-off location updated');
      } else {
        await createDropoff(payload);
        showSuccess('Drop-off location created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to save drop-off location');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!deactivateTarget) return;
    const next = deactivateTarget.isActive !== 1;
    try {
      await toggleDropoffActive(deactivateTarget.locationID, next);
      showSuccess(next ? 'Location activated' : 'Location deactivated');
      setDeactivateTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update status');
      setDeactivateTarget(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDropoff(deleteTarget.locationID);
      showSuccess('Drop-off location deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete location');
      setDeleteTarget(null);
    }
  }

  const columns: ColumnDef<DropoffAdminRow>[] = [
    {
      key: 'locationName',
      header: 'Location',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">{r.locationName}</span>,
      csvValue: (r) => r.locationName,
    },
    {
      key: 'branchName',
      header: 'Linked Branch',
      sortable: true,
      render: (r) => <span className="text-slate-700">{r.branchName}</span>,
      csvValue: (r) => r.branchName,
    },
    {
      key: 'city',
      header: 'Address',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.street} {r.number}, {r.cityName}
        </span>
      ),
      csvValue: (r) => `${r.street} ${r.number}, ${r.cityName}`,
    },
    {
      key: 'dropoffFee',
      header: 'One-way Fee',
      sortable: true,
      render: (r) => <span className="font-medium text-slate-900">€{Number(r.dropoffFee).toFixed(2)}</span>,
      csvValue: (r) => r.dropoffFee,
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
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeactivateTarget(r)}
            className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
          >
            <Power className="h-4 w-4" />
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
          <h1 className="text-2xl font-semibold text-slate-900">Drop-off Locations</h1>
          <p className="text-sm text-slate-500">
            Must be in the same city as the linked branch. One-way fee applies only when returning to a different branch than pick-up.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add location
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.locationID}
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
        searchPlaceholder="Search location, branch, or city..."
        filters={
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.branchID} value={b.branchID}>
                {b.branchName}
              </option>
            ))}
          </select>
        }
        exportFilename="dropoff-locations.csv"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {editing ? 'Edit drop-off location' : 'Add drop-off location'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Location name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Linked branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={branchID}
                    onChange={(e) => {
                      const nextBranch = branches.find((b) => b.branchID === Number(e.target.value));
                      setBranchID(e.target.value);
                      if (nextBranch) {
                        setAddress((prev) => ({ ...prev, cityID: nextBranch.cityID }));
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b.branchID} value={b.branchID}>
                        {b.branchName} ({b.cityName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-slate-700">One-way fee (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={dropoffFee}
                    onChange={(e) => setDropoffFee(e.target.value)}
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
                Active location
              </label>

              <AddressForm
                value={address}
                onChange={setAddress}
                allowedCityId={selectedBranch?.cityID}
              />

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
        title={deactivateTarget?.isActive === 1 ? 'Deactivate location' : 'Activate location'}
        message={`${deactivateTarget?.isActive === 1 ? 'Deactivate' : 'Activate'} "${deactivateTarget?.locationName}"?`}
        confirmLabel={deactivateTarget?.isActive === 1 ? 'Deactivate' : 'Activate'}
        destructive={deactivateTarget?.isActive === 1}
        onConfirm={handleToggleActive}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete drop-off location"
        message={`Delete "${deleteTarget?.locationName}"? Only possible if unused.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
