export const env = Object.freeze({
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api/v1',
  appName: (import.meta.env.VITE_APP_NAME as string | undefined) ?? 'RentACar',
});
