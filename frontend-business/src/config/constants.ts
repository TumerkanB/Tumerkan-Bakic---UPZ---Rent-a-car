export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  CHANGE_PASSWORD: '/change-password',
  COUNTRIES: '/admin/countries',
  CITIES: '/admin/cities',
  BRANCHES: '/branches',
  DROPOFFS: '/dropoffs',
  CARS_CATALOG: '/cars/catalog',
  CARS_MANAGE: '/cars',
  CARS_REGISTER: '/cars/new',
  CARS_DETAIL: '/cars/:carID',
  CLIENTS: '/clients',
  CLIENT_DETAIL: '/clients/:clientID',
  DOCUMENT_QUEUE: '/documents/queue',
  RESERVATIONS: '/reservations',
  RESERVATION_NEW: '/reservations/new',
  RESERVATION_DETAIL: '/reservations/:id',
  CONDITIONS: '/conditions',
  PAYMENTS: '/payments',
  INVOICES: '/invoices',
  DAMAGES: '/damages',
  FINES: '/fines',
  MAINTENANCE: '/maintenance',
});

export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'rentacar_auth_token',
});
