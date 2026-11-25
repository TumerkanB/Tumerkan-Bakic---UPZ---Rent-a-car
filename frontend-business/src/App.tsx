import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ROUTES } from './config/constants';
import { AuthProvider } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CatalogManagementPage } from './features/fleet/CatalogManagementPage';
import { FleetPage } from './features/fleet/FleetPage';
import { RegisterCarPage } from './features/fleet/RegisterCarPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.HOME} element={<DashboardPage />} />
              <Route path={ROUTES.CARS_CATALOG} element={<CatalogManagementPage />} />
              <Route path={ROUTES.CARS_MANAGE} element={<FleetPage />} />
              <Route path={ROUTES.CARS_REGISTER} element={<RegisterCarPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
