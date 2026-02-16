import React from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports: React.FC = () => {
  const { transactions } = useData();

  // 1. Cash In Hand by Receiver
  const cashByReceiver = transactions
    .filter(t => t.splits && t.splits.length > 0)
    .flatMap(t => t.splits || [])
    .reduce((acc, split) => {
      acc[split.receiverName] = (acc[split.receiverName] || 0) + split.amount;
      return acc;
    }, {} as Record<string, number>);

  const receiverData = Object.entries(cashByReceiver).map(([name, value]) => ({ name, value }));

  // 2. Monthly Collection (Mock logic for last 6 months based on available data)
  // Grouping by date string for simplicity
  const monthlyDataMap = transactions
    .filter(t => t.type === 'RENT_PAYMENT')
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + t.totalAmount;
      return acc;
    }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlyDataMap).map(([name, amount]) => ({ name, amount }));
  
  // Fill default if empty for visual appeal
  if (monthlyData.length === 0) {
    monthlyData.push({ name: 'Current', amount: 0 });
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash In Hand Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cash-in-Hand by Receiver</h2>
          {receiverData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={receiverData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {receiverData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No split payment data yet</div>
          )}
        </div>

        {/* Monthly Collection Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Rent Collection</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Collection']}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Detailed Ledger Section (Placeholder for complex app) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-lg font-semibold text-gray-800 mb-2">Note on Reports</h2>
         <p className="text-gray-500 text-sm">
           This dashboard provides a high-level view of your financial health. 
           To view individual tenant ledgers (debits/credits), please visit the Tenants page and select "View Ledger".
         </p>
      </div>
    </div>
  );
};

export default Reports;