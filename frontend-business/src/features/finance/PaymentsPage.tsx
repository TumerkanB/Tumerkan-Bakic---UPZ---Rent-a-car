import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  fetchPayments,
  fetchPendingRefunds,
  refundOverpayment,
  type PaymentRow,
  type PendingRefundRow,
} from './financeApi';

export function PaymentsPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [pendingRefunds, setPendingRefunds] = useState<PendingRefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchPayments({ page, pageSize: 20, q: q || undefined, paymentType: paymentType || undefined }),
      fetchPendingRefunds(),
    ])
      .then(([pRes, rRes]) => {
        setRows(pRes.data);
        setTotal(pRes.total);
        setPendingRefunds(rRes.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, [page, q, paymentType]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnDef<PaymentRow>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt',
      render: (r) => <span className="font-mono text-xs font-medium text-slate-900">{r.receiptNumber}</span>,
      csvValue: (r) => r.receiptNumber,
    },
    {
      key: 'reservationID',
      header: 'Reservation',
      render: (r) => (
        <Link to={`/reservations/${r.reservationID}`} className="font-mono text-xs text-blue-600 hover:underline">
          #{r.reservationID}
        </Link>
      ),
      csvValue: (r) => r.reservationID,
    },
    {
      key: 'paymentType',
      header: 'Type',
      render: (r) => <StatusBadge status={r.paymentType} />,
      csvValue: (r) => r.paymentType,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900">
            {Number(r.amount).toFixed(2)} {r.currencyCode}
          </div>
          {r.currencyCode !== 'EUR' && (
            <div className="text-slate-500">€{Number(r.amountBase).toFixed(2)} base</div>
          )}
        </div>
      ),
      csvValue: (r) => r.amountBase,
    },
    {
      key: 'method',
      header: 'Method',
      render: (r) => <span className="text-xs text-slate-700">{r.method}</span>,
      csvValue: (r) => r.method,
    },
    {
      key: 'paidAt',
      header: 'Date',
      render: (r) => <span className="text-xs text-slate-500">{new Date(r.paidAt).toLocaleString()}</span>,
      csvValue: (r) => r.paidAt,
    },
    {
      key: 'receivedBy',
      header: 'Received By',
      render: (r) => <span className="text-xs text-slate-600">{r.receivedBy ?? '—'}</span>,
      csvValue: (r) => r.receivedBy,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payments &amp; Refunds</h1>
        <p className="text-sm text-slate-500">Immutable payment ledger and pending overpayment/deposit refunds.</p>
      </div>

      {pendingRefunds.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Pending Refunds ({pendingRefunds.length})</h2>
          <div className="mt-3 space-y-2">
            {pendingRefunds.map((pr) => (
              <div
                key={pr.reservationID}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-xs"
              >
                <div>
                  <Link to={`/reservations/${pr.reservationID}`} className="font-mono font-semibold text-blue-600">
                    #{pr.reservationID}
                  </Link>{' '}
                  · {pr.clientName} ({pr.status}) — Overpayment: €{Number(pr.overpaymentToRefund).toFixed(2)} ·
                  Deposit held: €{Number(pr.depositHeld).toFixed(2)}
                </div>
                {Number(pr.overpaymentToRefund) > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      refundOverpayment(pr.reservationID, 'Card')
                        .then(() => {
                          showSuccess('Overpayment refunded');
                          load();
                        })
                        .catch((err) => showError(err instanceof ApiError ? err.message : 'Refund failed'))
                    }
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                  >
                    Refund overpayment (Card)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.paymentID}
        loading={loading}
        error={error}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
        search={q}
        onSearchChange={(v) => {
          setQ(v);
          setPage(1);
        }}
        searchPlaceholder="Search receipt #, reference, or reservation #..."
        exportFilename="payments.csv"
        filters={
          <select
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
          >
            <option value="">All types</option>
            <option value="Payment">Payment</option>
            <option value="Deposit">Deposit</option>
            <option value="Refund">Refund</option>
            <option value="DepositRefund">DepositRefund</option>
          </select>
        }
      />
    </div>
  );
}
