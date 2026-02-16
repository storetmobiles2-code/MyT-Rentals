import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, Tenant, Transaction, TransactionType, DashboardStats } from '../types';

interface DataContextType {
  properties: Property[];
  tenants: Tenant[];
  transactions: Transaction[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  generateMonthlyRent: () => void; // Helper to add rent due for all tenants
  getTenantBalance: (tenantId: string) => number;
  stats: DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock Data
const INITIAL_PROPERTIES: Property[] = [
  { id: '1', name: 'Sunrise Apts', address: '123 Market St', type: 'Apartment', ownerName: 'John Doe' },
  { id: '2', name: 'Downtown Commercial', address: '456 Main Blvd', type: 'Commercial', ownerName: 'Jane Smith' },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', propertyId: '1', name: 'Alice Johnson', phone: '555-0101', monthlyRent: 1200, leaseStart: '2023-01-01', currentBalance: 0 },
  { id: 't2', propertyId: '1', name: 'Bob Williams', phone: '555-0102', monthlyRent: 1500, leaseStart: '2023-02-15', currentBalance: 1500 }, // Owes 1 month
  { id: 't3', propertyId: '2', name: 'Tech Solutions Inc', phone: '555-0103', monthlyRent: 5000, leaseStart: '2022-06-01', currentBalance: -200 }, // Advance
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { 
    id: 'tx1', 
    tenantId: 't1', 
    propertyId: '1', 
    type: TransactionType.RENT_PAYMENT, 
    date: new Date().toISOString(), 
    totalAmount: 1200, 
    splits: [{ receiverName: 'John', amount: 1200 }],
    deductionAmount: 0
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Derived Stats
  const stats: DashboardStats = {
    totalArrears: tenants.reduce((acc, t) => acc + (t.currentBalance > 0 ? t.currentBalance : 0), 0),
    collectedThisMonth: transactions
      .filter(t => {
        const tDate = new Date(t.date);
        const now = new Date();
        return tDate.getMonth() === now.getMonth() && 
               tDate.getFullYear() === now.getFullYear() && 
               t.type === TransactionType.RENT_PAYMENT;
      })
      .reduce((acc, t) => acc + t.totalAmount, 0),
    totalProperties: properties.length,
    occupancyRate: (tenants.length / (properties.length * 2)) * 100 // Mock calculation logic
  };

  const addProperty = (prop: Omit<Property, 'id'>) => {
    const newProp = { ...prop, id: crypto.randomUUID() };
    setProperties([...properties, newProp]);
  };

  const addTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant = { ...tenant, id: crypto.randomUUID() };
    setTenants([...tenants, newTenant]);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: crypto.randomUUID() };
    setTransactions([newTx, ...transactions]);

    // Update Tenant Balance Logic
    if (tx.tenantId) {
      setTenants(prevTenants => prevTenants.map(t => {
        if (t.id !== tx.tenantId) return t;

        let newBalance = t.currentBalance;

        if (tx.type === TransactionType.RENT_PAYMENT) {
          // Balance reduces by Total Cash Paid + Deduction (Repair credit)
          const creditAmount = tx.totalAmount + (tx.deductionAmount || 0);
          newBalance -= creditAmount;
        } else if (tx.type === TransactionType.RENT_DUE) {
          // Balance increases when rent becomes due
          newBalance += tx.totalAmount;
        }

        return { ...t, currentBalance: newBalance };
      }));
    }
  };

  // Helper to simulate "First of the Month" rent roll
  const generateMonthlyRent = () => {
    const today = new Date().toISOString();
    const newTxs: Transaction[] = [];
    
    const updatedTenants = tenants.map(t => {
      newTxs.push({
        id: crypto.randomUUID(),
        tenantId: t.id,
        propertyId: t.propertyId,
        type: TransactionType.RENT_DUE,
        date: today,
        totalAmount: t.monthlyRent,
        description: 'Monthly Rent Auto-Charge'
      });
      return { ...t, currentBalance: t.currentBalance + t.monthlyRent };
    });

    setTransactions([...newTxs, ...transactions]);
    setTenants(updatedTenants);
  };

  const getTenantBalance = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId)?.currentBalance || 0;
  };

  return (
    <DataContext.Provider value={{ 
      properties, 
      tenants, 
      transactions, 
      addProperty, 
      addTenant, 
      addTransaction,
      generateMonthlyRent,
      getTenantBalance,
      stats
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};