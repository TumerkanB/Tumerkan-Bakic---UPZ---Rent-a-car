import { apiRequest } from '../../lib/apiClient';
import type { ClientAuthResponse } from '../auth/clientAuthApi';

export interface AccountProfile {
  clientID: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  username: string;
  dateOfBirth: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  addressID: number | null;
  street: string | null;
  number: string | null;
  apt: string | null;
  zip: string | null;
  cityID: number | null;
  cityName: string | null;
  countryID: number | null;
  countryName: string | null;
}

export interface AccountSummary {
  totalRentals: number;
  lifetimeSpend: number;
  loyaltyDiscountPercent: number;
}

export interface AccountReservation {
  reservationID: number;
  startDate: string;
  endDate: string;
  returnedAt: string | null;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  totalPrice: number | null;
  discountAmount: number;
  depositAmount: number | null;
  carID: number;
  plate: string;
  fuelType: string;
  transmission: string;
  brandName: string;
  modelName: string;
  categoryName: string;
  pickupBranch: string;
  dropoffPlace: string;
  thumbnail: string | null;
  totalDue: number | null;
  paid: number | null;
  balance: number | null;
  paymentStatus: string | null;
  depositHeld: number | null;
}

export interface AccountVerification {
  verificationID: number;
  documentType: 'DrivingLicence' | 'Passport' | 'NationalID' | 'Other';
  documentID: string;
  attribute: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  isVerified: number;
  verifiedAt: string | null;
  documentCountry: string | null;
}

export interface AccountPayment {
  paymentID: number;
  receiptNumber: string;
  reservationID: number;
  paymentType: string;
  amount: number;
  currencyCode: string;
  amountBase: number;
  method: string;
  paidAt: string;
}

export interface AccountOverviewResponse {
  profile: AccountProfile;
  summary: AccountSummary;
  reservations: AccountReservation[];
  verifications: AccountVerification[];
  payments: AccountPayment[];
}

export function fetchAccountOverview(): Promise<AccountOverviewResponse> {
  return apiRequest<AccountOverviewResponse>('/client/account');
}

export function updateClientProfile(payload: {
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    apt?: string;
    zip: string;
    cityID: number;
  };
}): Promise<ClientAuthResponse> {
  return apiRequest<ClientAuthResponse>('/client/account/profile', {
    method: 'PATCH',
    body: payload,
  });
}

export function updateClientUsername(username: string, currentPassword: string): Promise<ClientAuthResponse> {
  return apiRequest<ClientAuthResponse>('/client/account/username', {
    method: 'PATCH',
    body: { username, currentPassword },
  });
}

export function changeClientPassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/client/account/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  });
}
