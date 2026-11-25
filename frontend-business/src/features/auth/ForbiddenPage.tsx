import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '../../config/constants';

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center">
      <ShieldAlert className="h-10 w-10 text-red-500" />
      <h1 className="mt-3 text-xl font-semibold text-slate-900">403 — Access Denied</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your role does not have permission to view this page.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
