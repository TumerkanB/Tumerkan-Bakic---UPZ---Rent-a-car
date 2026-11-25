import { Link } from 'react-router';
import { ROUTES } from '../../config/constants';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center">
      <h1 className="text-xl font-semibold text-slate-900">404 — Page Not Found</h1>
      <p className="mt-1 text-sm text-slate-500">The requested route does not exist.</p>
      <Link
        to={ROUTES.HOME}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
