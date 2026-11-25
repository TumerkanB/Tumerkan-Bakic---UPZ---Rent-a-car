import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ClientLayout } from './components/layout/ClientLayout';
import { ROUTES } from './config/constants';
import { AccountPage } from './features/account/AccountPage';
import { ClientAuthProvider } from './features/auth/ClientAuthContext';
import { ClientLoginPage } from './features/auth/ClientLoginPage';
import { ClientRegisterPage } from './features/auth/ClientRegisterPage';
import { CatalogPage } from './features/catalog/CatalogPage';

export function App() {
  return (
    <ClientAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.HOME} element={<CatalogPage />} />
            <Route path={ROUTES.LOGIN} element={<ClientLoginPage />} />
            <Route path={ROUTES.REGISTER} element={<ClientRegisterPage />} />
            <Route path={ROUTES.ACCOUNT} element={<AccountPage />} />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </ClientAuthProvider>
  );
}
