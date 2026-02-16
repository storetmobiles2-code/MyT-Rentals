export type PropertyType = 'Apartment' | 'House' | 'Commercial';

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  ownerName: string;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  phone: string;
  monthlyRent: number;
  leaseStart: string;
  currentBalance: number; // Positive = Arrears (Owes money), Negative = Advance
}

export enum TransactionType {
  RENT_PAYMENT = 'RENT_PAYMENT',
  REPAIR = 'REPAIR',
  OWNER_PAYOUT = 'OWNER_PAYOUT',
  RENT_DUE = 'RENT_DUE' // Internal type to increase balance monthly
}

export interface TransactionSplit {
  receiverName: string;
  amount: number;
}

export interface Transaction {
  id: string;
  tenantId?: string; // Optional for owner payouts
  propertyId?: string;
  type: TransactionType;
  date: string;
  totalAmount: number; // The actual cash amount involved
  description?: string;
  
  // Specific to Rent Payment
  splits?: TransactionSplit[];
  deductionAmount?: number; // Amount deducted for repairs from rent
  deductionReason?: string;
}

// Helper for UI
export interface DashboardStats {
  totalArrears: number;
  collectedThisMonth: number;
  totalProperties: number;
  occupancyRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string; // Used for login (email or phone)
  picture?: string;
}