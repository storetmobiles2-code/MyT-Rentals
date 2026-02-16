import React from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { ArrowUpRight, ArrowDownRight, Users, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { stats, transactions, tenants, generateMonthlyRent } = useData();
  const { showToast } = useToast();

  const handleSimulateMonth = () => {
    generateMonthlyRent();
    showToast('Simulated new month: Rent charges applied.', 'info');
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your rental business</p>
        </div>
        <button 
          onClick={handleSimulateMonth}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300 shadow-sm"
        >
          Simulate New Month
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Arrears</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-2">
                ₹{stats.totalArrears.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
             <span className="text-rose-600 font-medium mr-1">Due now</span> from tenants
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Collected This Month</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">
                ₹{stats.collectedThisMonth.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="text-emerald-600 font-medium mr-1 flex items-center">
              <ArrowUpRight size={14} className="mr-1" /> 12%
            </span> vs last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tenants</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {tenants.length}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
             Active leases
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Defaulters</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {tenants.filter(t => t.currentBalance > 0).length}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
             Need follow up
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tenants.find(t => t.id === tx.tenantId)?.name || 'System'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${tx.type === 'RENT_PAYMENT' ? 'bg-emerald-100 text-emerald-800' : 
                        tx.type === 'RENT_DUE' ? 'bg-gray-100 text-gray-800' :
                        'bg-rose-100 text-rose-800'}
                    `}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${tx.type === 'RENT_PAYMENT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.type === 'RENT_PAYMENT' ? '+' : ''}₹{tx.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;