import { AlertTriangle, Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useToast } from '../../components/ui/ToastContext';
import { ApiError } from '../../lib/apiClient';
import {
  approveVerification,
  fetchUnverifiedDocuments,
  rejectVerification,
  type UnverifiedDocRow,
} from './clientsApi';

export function VerificationQueuePage() {
  const { showSuccess, showError } = useToast();
  const [docs, setDocs] = useState<UnverifiedDocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchUnverifiedDocuments()
      .then((res) => setDocs(res.data))
      .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed to load queue'))
      .finally(() => setLoading(false));
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toISOString().split('T')[0]!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Document Verification Queue</h1>
        <p className="text-sm text-slate-500">Review and approve pending client driving licences and IDs.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading queue...
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No unverified documents waiting for review.
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => {
            const expired = Boolean(d.expiryDate && d.expiryDate < today);
            return (
              <div
                key={d.verificationID}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/clients/${d.clientID}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {d.clientName}
                    </Link>
                    <span className="text-xs text-slate-500">({d.email})</span>
                    {expired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        Expired ({d.expiryDate})
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    <strong>{d.documentType}</strong> · <span className="font-mono">{d.documentID}</span> ·{' '}
                    {d.documentCountry ?? '—'} · Issue: {d.issueDate ?? '—'} · Expiry: {d.expiryDate ?? '—'}
                    {d.attribute ? ` · Note: ${d.attribute}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rejectingId === d.verificationID ? (
                    <>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rejection note..."
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        disabled={!reason.trim()}
                        onClick={() =>
                          rejectVerification(d.verificationID, reason.trim())
                            .then(() => {
                              setRejectingId(null);
                              setReason('');
                              showSuccess('Document rejected with note');
                              load();
                            })
                            .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                        }
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          approveVerification(d.verificationID)
                            .then(() => {
                              showSuccess('Document approved');
                              load();
                            })
                            .catch((err) => showError(err instanceof ApiError ? err.message : 'Failed'))
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(d.verificationID);
                          setReason('');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
