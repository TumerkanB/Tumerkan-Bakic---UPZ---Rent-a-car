import { Eye, Printer, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  fetchInvoiceDetail,
  fetchInvoices,
  fetchInvoiceStatusQueue,
  issueInvoice,
  voidInvoice,
  type InvoiceRow,
  type InvoiceStatusRow,
} from './financeApi';

export function InvoicesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [queue, setQueue] = useState<InvoiceStatusRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchInvoiceDetail>> | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchInvoices({ page, pageSize: 20, q: q || undefined, invoiceStatus: status || undefined }),
      fetchInvoiceStatusQueue(),
    ])
      .then(([iRes, qRes]) => {
        setRows(iRes.data);
        setTotal(iRes.total);
        setQueue(qRes.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [page, q, status]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnDef<InvoiceRow>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (r) => <span className="font-mono text-xs font-medium text-slate-900">{r.invoiceNumber}</span>,
      csvValue: (r) => r.invoiceNumber,
    },
    {
      key: 'invoiceType',
      header: 'Type',
      render: (r) => <span className="text-xs text-slate-700">{r.invoiceType}</span>,
      csvValue: (r) => r.invoiceType,
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
      key: 'customerName',
      header: 'Customer',
      render: (r) => <span className="text-xs font-medium text-slate-900">{r.customerName}</span>,
      csvValue: (r) => r.customerName,
    },
    {
      key: 'total',
      header: 'Total',
      render: (r) => (
        <span className="font-medium text-slate-900">
          {Number(r.total).toFixed(2)} {r.currencyCode}
        </span>
      ),
      csvValue: (r) => r.total,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
      csvValue: (r) => r.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          onClick={() =>
            fetchInvoiceDetail(r.invoiceID)
              .then((d) => {
                setDetail(d);
                setVoidReason('');
              })
              .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
          }
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-3.5 w-3.5" />
          View / Print
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invoices &amp; Credit Notes</h1>
        <p className="text-sm text-slate-500">Immutable fiscal documents and reservations awaiting invoicing.</p>
      </div>

      {queue.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Needs Invoicing ({queue.length})</h2>
          <div className="mt-2 space-y-2">
            {queue.map((item) => (
              <div
                key={item.reservationID}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-xs"
              >
                <div>
                  <Link to={`/reservations/${item.reservationID}`} className="font-mono font-semibold text-blue-600">
                    #{item.reservationID}
                  </Link>{' '}
                  · {item.reservationStatus} · Total due: €{Number(item.currentTotal).toFixed(2)} ·{' '}
                  <span className="font-medium text-amber-700">{item.invoiceState}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    issueInvoice(item.reservationID)
                      .then(() => {
                        showSuccess('Invoice issued');
                        load();
                      })
                      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                  }
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Issue invoice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.invoiceID}
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
        searchPlaceholder="Search invoice #, customer, or reservation #..."
        exportFilename="invoices.csv"
        filters={
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
          >
            <option value="">All statuses</option>
            <option value="Issued">Issued</option>
            <option value="Voided">Voided</option>
          </select>
        }
      />

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {detail.invoice.invoiceType} {detail.invoice.invoiceNumber}
                </h2>
                <p className="text-xs text-slate-500">
                  Issued {new Date(detail.invoice.issuedAt).toLocaleString()} · Reservation #
                  {detail.invoice.reservationID}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / PDF
                </button>
                <button type="button" onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold text-slate-900">{detail.invoice.customerName}</div>
                {detail.invoice.customerEmail && <div>{detail.invoice.customerEmail}</div>}
                {detail.invoice.customerAddress && <div>{detail.invoice.customerAddress}</div>}
              </div>

              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Unit</th>
                    <th className="py-2">Tax</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.lines.map((l) => (
                    <tr key={l.lineID}>
                      <td className="py-2">{l.lineNo}</td>
                      <td className="py-2">{l.description}</td>
                      <td className="py-2">{l.quantity}</td>
                      <td className="py-2">€{Number(l.unitAmount).toFixed(2)}</td>
                      <td className="py-2">€{Number(l.taxAmount).toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">€{Number(l.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end border-t border-slate-200 pt-3 text-right">
                <div className="space-y-1">
                  <div>Subtotal: €{Number(detail.invoice.subtotal).toFixed(2)}</div>
                  <div>Tax: €{Number(detail.invoice.taxTotal).toFixed(2)}</div>
                  <div className="text-base font-semibold text-slate-900">
                    Total: €{Number(detail.invoice.total).toFixed(2)} {detail.invoice.currencyCode}
                  </div>
                </div>
              </div>

              {detail.invoice.invoiceType === 'Invoice' && detail.invoice.status === 'Issued' && (
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                  <input
                    type="text"
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Reason to void & issue credit note..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    disabled={!voidReason.trim()}
                    onClick={() =>
                      voidInvoice(detail.invoice.invoiceID, voidReason.trim())
                        .then(() => {
                          showSuccess('Invoice voided and credit note issued');
                          setDetail(null);
                          load();
                        })
                        .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Void invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
