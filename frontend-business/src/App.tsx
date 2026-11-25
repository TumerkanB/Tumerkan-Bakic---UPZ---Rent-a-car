import { BrowserRouter, Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { ToastProvider } from './components/ui/ToastContext';
import { ROUTES } from './config/constants';
import { AuthProvider } from './features/auth/AuthContext';
import { ChangePasswordPage } from './features/auth/ChangePasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { NotFoundPage } from './features/auth/NotFoundPage';
import { PermissionRoute, ProtectedRoute } from './features/auth/ProtectedRoute';
import { ClientDetailPage } from './features/clients/ClientDetailPage';
import { ClientsPage } from './features/clients/ClientsPage';
import { VerificationQueuePage } from './features/clients/VerificationQueuePage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InvoicesPage } from './features/finance/InvoicesPage';
import { PaymentsPage } from './features/finance/PaymentsPage';
import { CarDetailPage } from './features/fleet/CarDetailPage';
import { CatalogManagementPage } from './features/fleet/CatalogManagementPage';
import { FleetPage } from './features/fleet/FleetPage';
import { RegisterCarPage } from './features/fleet/RegisterCarPage';
import { BranchesPage } from './features/locations/BranchesPage';
import { DropoffsPage } from './features/locations/DropoffsPage';
import { DamagesPage } from './features/operations/DamagesPage';
import { FinesPage } from './features/operations/FinesPage';
import { MaintenancePage } from './features/operations/MaintenancePage';
import { CitiesPage } from './features/reference/CitiesPage';
import { CountriesPage } from './features/reference/CountriesPage';
import { ConditionReportsPage } from './features/reservations/ConditionReportsPage';
import { NewReservationPage } from './features/reservations/NewReservationPage';
import { ReservationDetailPage } from './features/reservations/ReservationDetailPage';
import { ReservationsPage } from './features/reservations/ReservationsPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />

              <Route element={<AppLayout />}>
                <Route element={<PermissionRoute permission="VIEW_REPORTS" />}>
                  <Route path={ROUTES.HOME} element={<DashboardPage />} />
                </Route>

                <Route element={<PermissionRoute permission="MANAGE_CARS" />}>
                  <Route path={ROUTES.CARS_CATALOG} element={<CatalogManagementPage />} />
                  <Route path={ROUTES.CARS_MANAGE} element={<FleetPage />} />
                  <Route path={ROUTES.CARS_REGISTER} element={<RegisterCarPage />} />
                  <Route path={ROUTES.CARS_DETAIL} element={<CarDetailPage />} />
                  <Route path={ROUTES.BRANCHES} element={<BranchesPage />} />
                  <Route path={ROUTES.DROPOFFS} element={<DropoffsPage />} />
                </Route>

                <Route element={<PermissionRoute permission="MANAGE_CLIENTS" />}>
                  <Route path={ROUTES.CLIENTS} element={<ClientsPage />} />
                  <Route path={ROUTES.CLIENT_DETAIL} element={<ClientDetailPage />} />
                  <Route path={ROUTES.DOCUMENT_QUEUE} element={<VerificationQueuePage />} />
                </Route>

                <Route element={<PermissionRoute permission="MANAGE_RESERVATIONS" />}>
                  <Route path={ROUTES.RESERVATIONS} element={<ReservationsPage />} />
                  <Route path={ROUTES.RESERVATION_NEW} element={<NewReservationPage />} />
                  <Route path={ROUTES.RESERVATION_DETAIL} element={<ReservationDetailPage />} />
                  <Route path={ROUTES.CONDITIONS} element={<ConditionReportsPage />} />
                </Route>

                <Route element={<PermissionRoute permission="MANAGE_PAYMENTS" />}>
                  <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
                </Route>
                <Route element={<PermissionRoute permission="MANAGE_INVOICES" />}>
                  <Route path={ROUTES.INVOICES} element={<InvoicesPage />} />
                </Route>
                <Route element={<PermissionRoute permission="MANAGE_DAMAGES" />}>
                  <Route path={ROUTES.DAMAGES} element={<DamagesPage />} />
                </Route>
                <Route element={<PermissionRoute permission="MANAGE_FINES" />}>
                  <Route path={ROUTES.FINES} element={<FinesPage />} />
                </Route>
                <Route element={<PermissionRoute permission="MANAGE_MAINTENANCE" />}>
                  <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
                </Route>

                <Route element={<PermissionRoute adminOnly />}>
                  <Route path={ROUTES.COUNTRIES} element={<CountriesPage />} />
                  <Route path={ROUTES.CITIES} element={<CitiesPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
