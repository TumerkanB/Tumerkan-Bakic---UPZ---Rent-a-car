import { Navigate } from 'react-router';
import { ROUTES } from '../../config/constants';
import { useClientAuth } from '../auth/ClientAuthContext';

export function AccountPage() {
  const { client, isLoading } = useClientAuth();

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading account...</div>;
  }

  if (!client) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Account</h1>
        <p className="text-sm text-slate-500">Your client profile details</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Full name</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {client.name} {client.surname}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Username</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{client.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Client ID</dt>
            <dd className="mt-1 font-mono text-sm text-slate-700">#{client.clientID}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
