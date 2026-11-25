import { Car, LogOut, User } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../../config/constants';
import { env } from '../../config/env';
import { useClientAuth } from '../../features/auth/ClientAuthContext';

export function ClientLayout() {
  const { client, logout } = useClientAuth();
  const { pathname } = useLocation();
  const isResultsPage = pathname === ROUTES.RESULTS;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Car className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-slate-900">{env.appName}</span>
          </Link>

          <nav className="flex items-center gap-4">
            <NavLink
              to={ROUTES.HOME}
              end
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`
              }
            >
              Browse Cars
            </NavLink>

            {client ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to={ROUTES.ACCOUNT}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <User className="h-4 w-4" />
                  {client.username}
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main
        className={
          isResultsPage
            ? 'ml-0 w-full flex-1 pl-0'
            : 'mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6'
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
