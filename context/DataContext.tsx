import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, Tenant, Transaction, TransactionType, DashboardStats } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  properties: Property[];
  tenants: Tenant[];
  transactions: Transaction[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  generateMonthlyRent: () => void;
  getTenantBalance: (tenantId: string) => number;
  stats: DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data (Fallback for new users)
const INITIAL_PROPERTIES: Property[] = [
  { id: '1', name: 'Sunrise Apts', address: '123 Market St', type: 'Apartment', ownerName: 'John Doe' },
];

const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', propertyId: '1', name: 'Alice Johnson', phone: '555-0101', monthlyRent: 1200, leaseStart: '2023-01-01', currentBalance: 0 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error("DataProvider must be used within an authenticated context");
  }

  const STORAGE_KEY_PREFIX = `myt_rentals_${user.id}_`;

  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Failed to load ${key} from storage`, error);
      return fallback;
    }
  };

  const [properties, setProperties] = useState<Property[]>(() => 
    loadFromStorage('properties', INITIAL_PROPERTIES)
  );
  const [tenants, setTenants] = useState<Tenant[]>(() => 
    loadFromStorage('tenants', INITIAL_TENANTS)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    loadFromStorage('transactions', INITIAL_TRANSACTIONS)
  );

  // Persistence Effects - Keyed by User ID
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'properties', JSON.stringify(properties));
  }, [properties, STORAGE_KEY_PREFIX]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'tenants', JSON.stringify(tenants));
  }, [tenants, STORAGE_KEY_PREFIX]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(transactions));
  }, [transactions, STORAGE_KEY_PREFIX]);

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
    occupancyRate: properties.length > 0 ? (tenants.length / (properties.length * 2)) * 100 : 0
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

    if (tx.tenantId) {
      setTenants(prevTenants => prevTenants.map(t => {
        if (t.id !== tx.tenantId) return t;

        let newBalance = t.currentBalance;

        if (tx.type === TransactionType.RENT_PAYMENT) {
          const creditAmount = tx.totalAmount + (tx.deductionAmount || 0);
          newBalance -= creditAmount;
        } else if (tx.type === TransactionType.RENT_DUE) {
          newBalance += tx.totalAmount;
        }

        return { ...t, currentBalance: newBalance };
      }));
    }
  };

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