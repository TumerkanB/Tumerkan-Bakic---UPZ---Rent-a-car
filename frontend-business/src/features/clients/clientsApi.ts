import { apiRequest } from '../../lib/apiClient';
import type { AddressInput, PagedResult } from '../reference/referenceApi';

export interface ClientListRow {
  clientID: number;
  name: string;
  surname: string;
  email: string;
  username: string | null;
  phone: string | null;
  isActive: number;
  dateOfBirth: string | null;
  lastLoginAt: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  cityName: string | null;
  countryName: string | null;
  totalRentals: number;
  lifetimeSpend: number;
}

export interface ClientVerificationRow {
  verificationID: number;
  clientID: number;
  documentID: string;
  documentCountryID: number;
  documentCountry: string | null;
  documentType: 'DrivingLicence' | 'Passport' | 'NationalID' | 'Other';
  attribute: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  isVerified: number;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

export interface ClientWorkspaceResponse {
  client: ClientListRow & {
    createdAt: string;
    addressID: number | null;
    street: string | null;
    number: string | null;
    apt: string | null;
    zip: string | null;
    cityID: number | null;
    countryID: number | null;
    loyaltyDiscountPercent: number;
  };
  verifications: ClientVerificationRow[];
  reservations: {
    reservationID: number;
    startDate: string;
    endDate: string;
    status: string;
    plate: string;
    brandName: string;
    modelName: string;
    totalDue: number | null;
    paid: number | null;
    balance: number | null;
    paymentStatus: string | null;
  }[];
  payments: {
    paymentID: number;
    receiptNumber: string;
    reservationID: number;
    paymentType: string;
    amount: number;
    currencyCode: string;
    method: string;
    paidAt: string;
  }[];
  invoices: {
    invoiceID: number;
    invoiceNumber: string;
    invoiceType: string;
    status: string;
    reservationID: number;
    total: number;
    currencyCode: string;
    issuedAt: string;
  }[];
}

export interface UnverifiedDocRow {
  verificationID: number;
  clientID: number;
  clientName: string;
  email: string;
  documentType: string;
  documentID: string;
  documentCountry: string | null;
  attribute: string | null;
  issueDate: string | null;
  expiryDate: string | null;
}

export interface ClientBodyPayload {
  name: string;
  surname: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  isActive: boolean;
  address?: AddressInput | null;
}

export function fetchClients(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: 'true' | 'false';
  verifiedLicence?: 'true' | 'false';
  locked?: 'true' | 'false';
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return apiRequest<PagedResult<ClientListRow>>('/clients', { query: params });
}

export function createClientAdmin(body: ClientBodyPayload) {
  return apiRequest<{ clientID: number }>('/clients', { method: 'POST', body });
}

export function fetchClientWorkspace(clientID: number) {
  return apiRequest<ClientWorkspaceResponse>(`/clients/${clientID}`);
}

export function updateClientAdmin(clientID: number, body: ClientBodyPayload) {
  return apiRequest(`/clients/${clientID}`, { method: 'PATCH', body });
}

export function deleteClientAdmin(clientID: number) {
  return apiRequest(`/clients/${clientID}`, { method: 'DELETE' });
}

export function setClientCredentials(clientID: number, username: string, password: string) {
  return apiRequest(`/clients/${clientID}/credentials`, {
    method: 'POST',
    body: { username, password },
  });
}

export function unlockClientAccount(clientID: number) {
  return apiRequest(`/clients/${clientID}/unlock`, { method: 'POST' });
}

export function addVerification(
  clientID: number,
  body: {
    documentType: 'DrivingLicence' | 'Passport' | 'NationalID' | 'Other';
    documentID: string;
    documentCountryID: number;
    attribute?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    isVerified: boolean;
  },
) {
  return apiRequest(`/clients/${clientID}/documents`, { method: 'POST', body });
}

export function updateVerification(
  verificationID: number,
  body: {
    documentType: 'DrivingLicence' | 'Passport' | 'NationalID' | 'Other';
    documentID: string;
    documentCountryID: number;
    attribute?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
    isVerified: boolean;
  },
) {
  return apiRequest(`/clients/documents/${verificationID}`, { method: 'PATCH', body });
}

export function deleteVerification(verificationID: number) {
  return apiRequest(`/clients/documents/${verificationID}`, { method: 'DELETE' });
}

export function fetchUnverifiedDocuments() {
  return apiRequest<{ data: UnverifiedDocRow[] }>('/clients/documents/queue');
}

export function approveVerification(verificationID: number) {
  return apiRequest(`/clients/documents/${verificationID}/approve`, { method: 'PATCH' });
}

export function rejectVerification(verificationID: number, reason: string) {
  return apiRequest(`/clients/documents/${verificationID}/reject`, {
    method: 'PATCH',
    body: { reason },
  });
}
