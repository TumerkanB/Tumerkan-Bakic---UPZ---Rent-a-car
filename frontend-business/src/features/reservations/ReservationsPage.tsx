import { Car, Eye, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ROUTES } from '../../config/constants';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { fetchBranches, type BranchItem } from '../fleet/fleetApi';
import { fetchReservations, type ReservationListRow } from './reservationsApi';

export function ReservationsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ReservationListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('reservationID');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [branchID, setBranchID] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [unpaid, setUnpaid] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches().then((res) => setBranches(res.items)).catch(() => undefined);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchReservations({
      page,
      pageSize: 20,
      q: q || undefined,
      status: status || undefined,
      branchID: branchID ? Number(branchID) : undefined,
      overdue,
      unpaid,
      sort,
      order,
    })
      .then((res) => {
        setRows(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load reservations'))
      .finally(() => setLoading(false));
  }, [page, q, status, branchID, overdue, unpaid, sort, order]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnDef<ReservationListRow>[] = [
    {
      key: 'reservationID',
      header: '#',
      sortable: true,
      render: (r) => <span className="font-mono text-xs font-medium text-slate-700">#{r.reservationID}</span>,
      csvValue: (r) => r.reservationID,
    },
    {
      key: 'clientName',
      header: 'Client',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900">{r.clientName}</div>
          <div className="text-xs text-slate-500">{r.clientEmail}</div>
        </div>
      ),
      csvValue: (r) => r.clientName,
    },
    {
      key: 'car',
      header: 'Vehicle',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.thumbnail ? (
            <img src={r.thumbnail} alt="" className="h-9 w-12 rounded object-cover" />
          ) : (
            <div className="flex h-9 w-12 items-center justify-center rounded bg-slate-100 text-slate-400">
              <Car className="h-4 w-4" />
            </div>
          )}
          <div>
            <div className="font-medium text-slate-900">
              {r.brandName} {r.modelName}
            </div>
            <div className="font-mono text-xs text-slate-500">{r.plate}</div>
          </div>
        </div>
      ),
      csvValue: (r) => `${r.brandName} ${r.modelName} (${r.plate})`,
    },
    {
      key: 'startDate',
      header: 'Dates',
      sortable: true,
      render: (r) => (
        <div className="text-xs text-slate-600">
          <div>{new Date(r.startDate).toLocaleString()}</div>
          <div>→ {new Date(r.endDate).toLocaleString()}</div>
        </div>
      ),
      csvValue: (r) => `${r.startDate} - ${r.endDate}`,
    },
    {
      key: 'pickupBranch',
      header: 'Branch / Drop-off',
      render: (r) => (
        <div className="text-xs text-slate-600">
          <div>{r.pickupBranch}</div>
          <div className="text-slate-400">→ {r.dropoffPlace}</div>
        </div>
      ),
      csvValue: (r) => `${r.pickupBranch} -> ${r.dropoffPlace}`,
    },
    {
      key: 'totalDue',
      header: 'Total / Balance',
      sortable: true,
      render: (r) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900">€{Number(r.totalDue ?? 0).toFixed(2)}</div>
          <div className={Number(r.balance ?? 0) > 0 ? 'text-red-600' : 'text-slate-500'}>
            Bal: €{Number(r.balance ?? 0).toFixed(2)}
          </div>
        </div>
      ),
      csvValue: (r) => r.totalDue ?? 0,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.isOverdue === 1 ? 'Overdue' : r.status} />
          {r.paymentStatus && <span className="text-[11px] text-slate-500">{r.paymentStatus}</span>}
        </div>
      ),
      csvValue: (r) => r.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <Link
          to={`/reservations/${r.reservationID}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" />
          Open
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservations</h1>
          <p className="text-sm text-slate-500">Bookings, handovers, returns, charges, and settlements.</p>
        </div>
        <Link
          to={ROUTES.RESERVATION_NEW}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New reservation
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.reservationID}
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
        searchPlaceholder="Search #, client, email, plate..."
        exportFilename="reservations.csv"
        filters={
          <>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {user?.branchID === null && (
              <select
                value={branchID}
                onChange={(e) => {
                  setBranchID(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.branchID} value={b.branchID}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={overdue}
                onChange={(e) => {
                  setOverdue(e.target.checked);
                  setPage(1);
                }}
              />
              Overdue
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={unpaid}
                onChange={(e) => {
                  setUnpaid(e.target.checked);
                  setPage(1);
                }}
              />
              Unpaid balance
            </label>
          </>
        }
      />
    </div>
  );
}
