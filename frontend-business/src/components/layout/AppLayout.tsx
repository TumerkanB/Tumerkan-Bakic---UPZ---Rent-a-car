import { Car, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../../config/constants';
import { env } from '../../config/env';
import { useAuth } from '../../features/auth/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isCarsSection = pathname.startsWith('/cars');
  const [carsOpen, setCarsOpen] = useState(true);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-1.5 text-xs font-medium transition ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Car className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-slate-900">{env.appName}</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLink to={ROUTES.HOME} end className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          <div>
            <button
              type="button"
              onClick={() => setCarsOpen((o) => !o)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                isCarsSection ? 'text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Car className="h-4 w-4" />
                Cars
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${carsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {carsOpen && (
              <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-3">
                <NavLink to={ROUTES.CARS_CATALOG} className={subLinkClass}>
                  Manage manufacturers, brands &amp; models
                </NavLink>
                <NavLink to={ROUTES.CARS_MANAGE} end className={subLinkClass}>
                  Manage cars
                </NavLink>
                <NavLink to={ROUTES.CARS_REGISTER} className={subLinkClass}>
                  Register new car
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user?.username}</p>
              <p className="truncate text-xs text-slate-500">{user?.roleName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
