import { apiRequest } from '../../lib/apiClient';
import type { PagedResult } from '../reference/referenceApi';

export interface PaymentRow {
  paymentID: number;
  receiptNumber: string;
  reservationID: number;
  paymentType: string;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  amountBase: number;
  method: string;
  reference: string | null;
  paidAt: string;
  receivedBy: string | null;
}

export interface PendingRefundRow {
  reservationID: number;
  status: string;
  clientName: string;
  overpaymentToRefund: number;
  depositHeld: number;
}

export interface InvoiceRow {
  invoiceID: number;
  invoiceNumber: string;
  invoiceType: string;
  status: string;
  reservationID: number;
  issuedAt: string;
  customerName: string;
  currencyCode: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  creditsInvoiceID: number | null;
  voidReason: string | null;
  issuedBy: string | null;
}

export interface InvoiceStatusRow {
  reservationID: number;
  reservationStatus: string;
  currentTotal: number;
  invoiceNumber: string | null;
  invoicedTotal: number | null;
  invoiceState: string;
}

export function fetchPayments(params: {
  page: number;
  pageSize: number;
  q?: string;
  paymentType?: string;
}) {
  return apiRequest<PagedResult<PaymentRow>>('/payments', { query: params });
}

export function fetchPendingRefunds() {
  return apiRequest<{ data: PendingRefundRow[] }>('/payments/pending-refunds');
}

export function refundOverpayment(reservationID: number, method: string) {
  return apiRequest(`/payments/refund/${reservationID}`, { method: 'POST', body: { method } });
}

export function fetchInvoices(params: {
  page: number;
  pageSize: number;
  q?: string;
  invoiceStatus?: string;
}) {
  return apiRequest<PagedResult<InvoiceRow>>('/invoices', { query: params });
}

export function fetchInvoiceStatusQueue() {
  return apiRequest<{ data: InvoiceStatusRow[] }>('/invoices/status');
}

export function fetchInvoiceDetail(id: number) {
  return apiRequest<{
    invoice: InvoiceRow & { customerEmail: string | null; customerAddress: string | null; discount: number };
    lines: {
      lineID: number;
      lineNo: number;
      description: string;
      quantity: number;
      unitAmount: number;
      amount: number;
      taxRatePercent: number;
      taxAmount: number;
    }[];
  }>(`/invoices/${id}`);
}

export function voidInvoice(id: number, reason: string) {
  return apiRequest<{ creditNoteID: number }>(`/invoices/${id}/void`, { method: 'POST', body: { reason } });
}

export function issueInvoice(reservationID: number) {
  return apiRequest<{ invoiceID: number }>(`/invoices/issue/${reservationID}`, { method: 'POST' });
}
