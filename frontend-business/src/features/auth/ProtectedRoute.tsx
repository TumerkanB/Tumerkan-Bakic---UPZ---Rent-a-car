import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../../config/constants';
import { useAuth } from './AuthContext';
import { ForbiddenPage } from './ForbiddenPage';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">Loading session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.mustChangePassword && pathname !== ROUTES.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }

  return <Outlet />;
}

export function PermissionRoute({
  permission,
  adminOnly,
}: {
  permission?: string;
  adminOnly?: boolean;
}) {
  const { isAdmin, hasPermission } = useAuth();

  if (adminOnly && !isAdmin) {
    return <ForbiddenPage />;
  }
  if (permission && !hasPermission(permission)) {
    return <ForbiddenPage />;
  }
  return <Outlet />;
}
