import React from 'react';
import { useData } from '../context/DataContext';
import { ArrowDownLeft, ArrowUpRight, Wrench, Receipt } from 'lucide-react';
import { TransactionType } from '../types';

const Transactions: React.FC = () => {
  const { transactions, tenants } = useData();

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.RENT_PAYMENT: return <ArrowDownLeft size={20} className="text-emerald-600" />;
      case TransactionType.RENT_DUE: return <Receipt size={20} className="text-gray-500" />;
      case TransactionType.REPAIR: return <Wrench size={20} className="text-orange-600" />;
      default: return <ArrowUpRight size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.RENT_PAYMENT: return 'bg-emerald-50';
      case TransactionType.RENT_DUE: return 'bg-gray-100';
      case TransactionType.REPAIR: return 'bg-orange-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500">History of all payments and expenses</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Tenant / Details</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getBgColor(tx.type)}`}>
                        {getIcon(tx.type)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {tx.type === TransactionType.RENT_PAYMENT ? 'Payment' : 
                         tx.type === TransactionType.RENT_DUE ? 'Rent Due' : tx.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{tenants.find(t => t.id === tx.tenantId)?.name || 'System / General'}</div>
                    {tx.description && <div className="text-xs text-gray-500 mt-1">{tx.description}</div>}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === TransactionType.RENT_PAYMENT ? 'text-emerald-600' : 'text-gray-900'}`}>
                    ₹{tx.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.splits && tx.splits.length > 0 ? (
                      <div className="text-xs text-gray-500">
                        {tx.splits.map((s, idx) => (
                          <div key={idx}>{s.receiverName}: ₹{s.amount}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                    {tx.deductionAmount ? (
                       <div className="text-xs text-rose-500 mt-1">
                         Repairs: -₹{tx.deductionAmount}
                       </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;