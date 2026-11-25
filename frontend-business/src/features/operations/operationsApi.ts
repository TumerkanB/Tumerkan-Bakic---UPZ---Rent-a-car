import { apiRequest } from '../../lib/apiClient';

export interface DamageRow {
  damageID: number;
  carID: number;
  plate: string;
  modelName: string;
  brandName: string;
  reservationID: number | null;
  reportDate: string;
  description: string;
  repairCost: number | null;
  isRepaired: number;
  billedChargeID: number | null;
  reportedBy: string | null;
}

export interface FineRow {
  fineID: number;
  carID: number;
  plate: string;
  fineType: 'Speeding' | 'Parking' | 'Toll' | 'Other';
  occurredAt: string;
  amount: number;
  referenceNo: string | null;
  description: string | null;
  status: 'Received' | 'Billed' | 'Paid' | 'Disputed' | 'Void';
  reservationID: number | null;
  clientName: string | null;
  billedChargeID: number | null;
}

export interface MaintenanceGlobalRow {
  maintenanceID: number;
  plate: string;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  cost: number;
  description: string | null;
  performedBy: string | null;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  loggedBy: string | null;
}

export function fetchDamages() {
  return apiRequest<{ data: DamageRow[] }>('/damages');
}

export function reportDamage(body: {
  carID: number;
  reservationID?: number | null;
  description: string;
  repairCost?: number | null;
}) {
  return apiRequest('/damages', { method: 'POST', body });
}

export function billDamage(damageID: number, amount: number) {
  return apiRequest(`/damages/${damageID}/bill`, { method: 'POST', body: { amount } });
}

export function markDamageRepaired(damageID: number, repairCost: number) {
  return apiRequest(`/damages/${damageID}/repaired`, { method: 'PATCH', body: { repairCost } });
}

export function fetchFines() {
  return apiRequest<{ data: FineRow[] }>('/fines');
}

export function createFine(body: {
  carID: number;
  fineType: 'Speeding' | 'Parking' | 'Toll' | 'Other';
  occurredAt: string;
  amount: number;
  referenceNo?: string | null;
  description?: string | null;
}) {
  return apiRequest('/fines', { method: 'POST', body });
}

export function billFine(fineID: number) {
  return apiRequest(`/fines/${fineID}/bill`, { method: 'POST' });
}

export function setFineStatus(fineID: number, status: string) {
  return apiRequest(`/fines/${fineID}/status`, { method: 'PATCH', body: { status } });
}

export function fetchMaintenanceOverview() {
  return apiRequest<{
    records: MaintenanceGlobalRow[];
    serviceDue: { carID: number; plate: string; branchName: string; issues: string }[];
  }>('/maintenance');
}

export function createGlobalMaintenance(body: {
  carID: number;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  cost: number;
  description?: string | null;
  performedBy?: string | null;
  nextDueDate?: string | null;
  nextDueMileage?: number | null;
}) {
  return apiRequest('/maintenance', { method: 'POST', body });
}
