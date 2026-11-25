import { apiRequest } from '../../lib/apiClient';
import type { PagedResult } from '../reference/referenceApi';

export interface ReservationListRow {
  reservationID: number;
  clientID: number;
  carID: number;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  clientName: string;
  clientEmail: string;
  plate: string;
  brandName: string;
  modelName: string;
  thumbnail: string | null;
  pickupBranch: string;
  dropoffPlace: string;
  totalDue: number | null;
  paid: number | null;
  balance: number | null;
  paymentStatus: string | null;
  depositHeld: number | null;
  depositRequired: number | null;
  isOverdue: number;
}

export interface AvailableCarCard {
  carID: number;
  plate: string;
  branchID: number;
  branchName: string;
  categoryName: string;
  brandName: string;
  modelName: string;
  fuelType: string;
  transmission: string;
  color: string | null;
  currentMileage: number;
  brandLogo: string | null;
  thumbnail: string | null;
  dailyRate: number;
  estimatedTotal: number;
  depositAmount: number;
}

export interface ReservationWorkspace {
  reservation: {
    reservationID: number;
    clientID: number;
    carID: number;
    startDate: string;
    endDate: string;
    returnedAt: string | null;
    status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
    pickupBranchID: number;
    dropoffLocationID: number | null;
    totalPrice: number | null;
    depositAmount: number | null;
    startMileage: number | null;
    endMileage: number | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    discountPercent: number;
    discountFixed: number;
    discountAmount: number;
    promoCode: string | null;
    clientName: string;
    clientEmail: string;
    clientPhone: string | null;
    plate: string;
    fuelType: string;
    transmission: string;
    currentMileage: number;
    brandName: string;
    modelName: string;
    categoryName: string;
    pickupBranch: string;
    dropoffPlace: string;
    createdBy: string | null;
    cancelledBy: string | null;
  };
  balance: {
    rentalGross: number;
    discount: number;
    rentalDue: number;
    charges: number;
    tax: number;
    totalDue: number;
    paid: number;
    balance: number;
    depositRequired: number;
    depositHeld: number;
    paymentStatus: string;
  } | null;
  charges: {
    chargeID: number;
    chargeType: string;
    description: string;
    quantity: number;
    unitAmount: number;
    amount: number;
    createdAt: string;
    createdBy: string | null;
  }[];
  drivers: {
    reservationID: number;
    clientID: number;
    name: string;
    surname: string;
    addedAt: string;
    addedBy: string | null;
  }[];
  payments: {
    paymentID: number;
    receiptNumber: string;
    paymentType: string;
    amount: number;
    currencyCode: string;
    amountBase: number;
    method: string;
    reference: string | null;
    paidAt: string;
    receivedBy: string | null;
  }[];
  invoices: {
    invoiceID: number;
    invoiceNumber: string;
    invoiceType: string;
    status: string;
    total: number;
    currencyCode: string;
    issuedAt: string;
  }[];
  conditions: {
    conditionID: number;
    stage: 'Pickup' | 'Return';
    recordedAt: string;
    mileage: number;
    fuelPercent: number;
    isClean: number;
    existingDamage: string | null;
    notes: string | null;
    recordedBy: string | null;
  }[];
  photos: {
    photoID: number;
    conditionID: number;
    fileReference: string;
    caption: string | null;
  }[];
  conditionCompare: {
    pickupMileage: number | null;
    returnMileage: number | null;
    distanceDriven: number | null;
    pickupFuel: number | null;
    returnFuel: number | null;
    fuelUsedPercent: number | null;
  } | null;
  availableExtras: {
    extraID: number;
    extraName: string;
    pricingType: 'PerDay' | 'Flat';
    unitPrice: number;
  }[];
  currencies: {
    currencyCode: string;
    currencyName: string;
    exchangeRateToBase: number;
    isBase: number;
  }[];
}

export function fetchReservations(params: {
  page: number;
  pageSize: number;
  q?: string;
  status?: string;
  branchID?: number;
  fromDate?: string;
  toDate?: string;
  overdue?: boolean;
  unpaid?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return apiRequest<PagedResult<ReservationListRow>>('/reservations', {
    query: {
      ...params,
      overdue: params.overdue ? 'true' : undefined,
      unpaid: params.unpaid ? 'true' : undefined,
    },
  });
}

export function fetchAvailableCarsForBooking(params: {
  startDate: string;
  endDate: string;
  branchID?: number;
}) {
  return apiRequest<{ items: AvailableCarCard[] }>('/reservations/available-cars', { query: params });
}

export function createReservation(body: {
  clientID: number;
  carID: number;
  startDate: string;
  endDate: string;
  pickupBranchID: number;
  dropoffLocationID?: number | null;
  promoCode?: string;
}) {
  return apiRequest<{ reservationID: number }>('/reservations', { method: 'POST', body });
}

export function fetchReservationWorkspace(id: number) {
  return apiRequest<ReservationWorkspace>(`/reservations/${id}`);
}

export function updateReservationDates(id: number, startDate: string, endDate: string) {
  return apiRequest(`/reservations/${id}/dates`, { method: 'PATCH', body: { startDate, endDate } });
}

export function startRental(id: number) {
  return apiRequest(`/reservations/${id}/start`, { method: 'POST' });
}

export function completeRental(id: number, endMileage: number, returnedAt: string) {
  return apiRequest(`/reservations/${id}/complete`, { method: 'POST', body: { endMileage, returnedAt } });
}

export function cancelReservation(id: number, reason: string) {
  return apiRequest(`/reservations/${id}/cancel`, { method: 'POST', body: { reason } });
}

export function applyPromo(id: number, code: string) {
  return apiRequest(`/reservations/${id}/promo`, { method: 'POST', body: { code } });
}

export function removePromo(id: number) {
  return apiRequest(`/reservations/${id}/promo`, { method: 'DELETE' });
}

export function addExtra(id: number, extraID: number, quantity: number) {
  return apiRequest(`/reservations/${id}/extras`, { method: 'POST', body: { extraID, quantity } });
}

export function addCharge(
  id: number,
  body: { chargeType: string; description: string; quantity: number; unitAmount: number },
) {
  return apiRequest(`/reservations/${id}/charges`, { method: 'POST', body });
}

export function addDriver(id: number, clientID: number) {
  return apiRequest(`/reservations/${id}/drivers`, { method: 'POST', body: { clientID } });
}

export function removeDriver(id: number, driverId: number) {
  return apiRequest(`/reservations/${id}/drivers/${driverId}`, { method: 'DELETE' });
}

export function recordCondition(
  id: number,
  body: {
    stage: 'Pickup' | 'Return';
    mileage: number;
    fuelPercent: number;
    isClean: boolean;
    existingDamage?: string | null;
    notes?: string | null;
    photos?: { fileReference: string; caption?: string | null }[];
  },
) {
  return apiRequest(`/reservations/${id}/conditions`, { method: 'POST', body });
}

export function recordReservationPayment(
  id: number,
  body: {
    paymentType: 'Payment' | 'Refund' | 'Deposit' | 'DepositRefund';
    amount: number;
    currencyCode: string;
    method: 'Cash' | 'Card' | 'BankTransfer' | 'Other';
    reference?: string | null;
  },
) {
  return apiRequest(`/reservations/${id}/payments`, { method: 'POST', body });
}

export function settleDeposit(id: number, method: string) {
  return apiRequest(`/reservations/${id}/settle-deposit`, { method: 'POST', body: { method } });
}

export function refundOverpayment(id: number, method: string) {
  return apiRequest(`/reservations/${id}/refund-overpayment`, { method: 'POST', body: { method } });
}

export function issueReservationInvoice(id: number) {
  return apiRequest(`/reservations/${id}/invoice`, { method: 'POST' });
}

export function fetchConditionReports(q?: string) {
  return apiRequest<{
    data: {
      conditionID: number;
      reservationID: number;
      stage: string;
      recordedAt: string;
      mileage: number;
      fuelPercent: number;
      isClean: number;
      existingDamage: string | null;
      notes: string | null;
      plate: string;
      brandName: string;
      modelName: string;
      recordedBy: string | null;
      photoCount: number;
    }[];
  }>('/reservations/conditions', { query: { q } });
}
