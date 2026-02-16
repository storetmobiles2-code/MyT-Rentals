import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { User, Phone, Home, Plus, Search, X, ArrowDownLeft, ArrowUpRight, Receipt, AlertCircle, Bell, Check, Wallet, CheckSquare } from 'lucide-react';
import { Tenant, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Tenants: React.FC = () => {
  const { tenants, properties, addTenant, transactions, addTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [remindedTenants, setRemindedTenants] = useState<Set<string>>(new Set());
  
  // Bulk Selection State
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
    name: '',
    phone: '',
    propertyId: properties[0]?.id || '',
    monthlyRent: 0,
    leaseStart: new Date().toISOString().split('T')[0],
    currentBalance: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTenant(formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      propertyId: properties[0]?.id || '',
      monthlyRent: 0,
      leaseStart: new Date().toISOString().split('T')[0],
      currentBalance: 0
    });
  };

  const handleRemind = (tenant: Tenant) => {
    if (window.confirm(`Send payment reminder to ${tenant.name} (${tenant.phone})?`)) {
      setRemindedTenants(prev => {
        const next = new Set(prev);
        next.add(tenant.id);
        return next;
      });
      // Simulate API call delay
      setTimeout(() => {
        // Ideally show a toast here
      }, 500);
    }
  };

  const getStatusColor = (balance: number) => {
    if (balance > 0) return 'bg-rose-100 text-rose-700 border-rose-200'; // Owes money
    if (balance < 0) return 'bg-blue-100 text-blue-700 border-blue-200'; // Advance
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // All clear
  };

  const getStatusText = (balance: number) => {
    if (balance > 0) return `Due: ₹${balance.toLocaleString()}`;
    if (balance < 0) return `Adv: ₹${Math.abs(balance).toLocaleString()}`;
    return 'Paid';
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone.includes(searchQuery)
  );

  // Bulk Action Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTenantIds(new Set(filteredTenants.map(t => t.id)));
    } else {
      setSelectedTenantIds(new Set());
    }
  };

  const handleSelectTenant = (id: string) => {
    const newSelected = new Set(selectedTenantIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTenantIds(newSelected);
  };

  const handleBulkRemind = () => {
    const count = selectedTenantIds.size;
    if (count === 0) return;
    
    if (window.confirm(`Send payment reminders to ${count} selected tenants?`)) {
      setRemindedTenants(prev => {
        const next = new Set(prev);
        selectedTenantIds.forEach(id => next.add(id));
        return next;
      });
      setSelectedTenantIds(new Set()); // Reset selection
    }
  };

  const handleBulkPay = () => {
    const count = selectedTenantIds.size;
    if (count === 0) return;

    if (window.confirm(`Mark ${count} selected tenants as paid? This will record a payment transaction for their monthly rent.`)) {
      selectedTenantIds.forEach(id => {
        const tenant = tenants.find(t => t.id === id);
        if (tenant) {
          addTransaction({
            tenantId: tenant.id,
            propertyId: tenant.propertyId,
            type: TransactionType.RENT_PAYMENT,
            date: new Date().toISOString(),
            totalAmount: tenant.monthlyRent,
            description: 'Bulk Payment: Marked as Paid'
          });
        }
      });
      setSelectedTenantIds(new Set()); // Reset selection
    }
  };

  // Ledger Logic
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const tenantTransactions = transactions
    .filter(t => t.tenantId === selectedTenantId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Chart Logic
  const paymentHistoryData = useMemo(() => {
    if (!selectedTenantId) return [];
    
    // Initialize last 6 months
    const data = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i)); // 5, 4, 3, 2, 1, 0 months ago
      return {
        monthKey: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString('default', { month: 'short' }),
        amount: 0
      };
    });

    // Aggregate payments
    tenantTransactions.forEach(tx => {
      if (tx.type === TransactionType.RENT_PAYMENT) {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const month = data.find(m => m.monthKey === key);
        if (month) {
          month.amount += tx.totalAmount;
        }
      }
    });

    return data;
  }, [selectedTenantId, tenantTransactions]);

  const allSelected = filteredTenants.length > 0 && selectedTenantIds.size === filteredTenants.length;

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500">Manage tenants and leases</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Add Tenant
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search tenants by name or phone..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4 w-12">
                   <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Rent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className={`hover:bg-gray-50 transition-colors ${selectedTenantIds.has(tenant.id) ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                          checked={selectedTenantIds.has(tenant.id)}
                          onChange={() => handleSelectTenant(tenant.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={12} /> {tenant.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home size={16} className="text-gray-400" />
                        {properties.find(p => p.id === tenant.propertyId)?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{tenant.monthlyRent.toLocaleString()}<span className="text-gray-400 font-normal">/mo</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tenant.currentBalance)}`}>
                        {getStatusText(tenant.currentBalance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {tenant.currentBalance > 0 && (
                          <button 
                            onClick={() => handleRemind(tenant)}
                            disabled={remindedTenants.has(tenant.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                              ${remindedTenants.has(tenant.id)
                                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-default'
                                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                              }
                            `}
                            title={remindedTenants.has(tenant.id) ? "Reminder sent" : "Send payment reminder"}
                          >
                            {remindedTenants.has(tenant.id) ? (
                              <>
                                <Check size={14} /> Sent
                              </>
                            ) : (
                              <>
                                <Bell size={14} /> Remind
                              </>
                            )}
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedTenantId(tenant.id)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm transition-colors"
                        >
                          View Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <p>No tenants found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedTenantIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl border border-gray-200 z-40 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-gray-900">
             <div className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
               {selectedTenantIds.size}
             </div>
             <span className="font-medium text-sm">Selected</span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkRemind} 
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              <Bell size={16} />
              <span className="hidden sm:inline">Send Reminder</span>
            </button>
            <button 
              onClick={handleBulkPay} 
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ml-1"
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">Mark as Paid</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add New Tenant</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})}>
                    <option value="" disabled>Select Property</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                  <input required type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: Number(e.target.value)})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
                  <input required type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    value={formData.leaseStart} onChange={e => setFormData({...formData, leaseStart: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                <p className="text-xs text-gray-500 mb-1">Positive for Arrears (Due), Negative for Advance</p>
                <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                  value={formData.currentBalance} onChange={e => setFormData({...formData, currentBalance: Number(e.target.value)})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors">Save Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   {selectedTenant.name}
                   <span className={`text-sm px-2 py-0.5 rounded-full border font-normal ${getStatusColor(selectedTenant.currentBalance)}`}>
                     {getStatusText(selectedTenant.currentBalance)}
                   </span>
                 </h2>
                 <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                   <Home size={14} /> {properties.find(p => p.id === selectedTenant.propertyId)?.name}
                   <span className="text-gray-300">|</span>
                   <Phone size={14} /> {selectedTenant.phone}
                 </p>
               </div>
               <button 
                 onClick={() => setSelectedTenantId(null)}
                 className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors"
               >
                 <X size={24} />
               </button>
            </div>

            {/* Modal Content - Chart & Scrollable Table */}
            <div className="flex-1 overflow-y-auto p-0">
               {/* Chart Section */}
               <div className="p-6 border-b border-gray-100 bg-white">
                 <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment History (6 Months)</h3>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentHistoryData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                          cursor={{fill: '#f9fafb'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Paid']}
                        />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               {tenantTransactions.length > 0 ? (
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium sticky top-0 z-10">
                     <tr>
                       <th className="px-6 py-4 bg-gray-50">Date</th>
                       <th className="px-6 py-4 bg-gray-50">Type</th>
                       <th className="px-6 py-4 bg-gray-50">Description</th>
                       <th className="px-6 py-4 bg-gray-50 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {tenantTransactions.map((tx) => (
                       <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                           {new Date(tx.date).toLocaleDateString()}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                              ${tx.type === TransactionType.RENT_PAYMENT ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                tx.type === TransactionType.RENT_DUE ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                'bg-orange-50 text-orange-700 border-orange-100'}
                            `}>
                              {tx.type === TransactionType.RENT_PAYMENT ? <ArrowDownLeft size={12} /> : 
                               tx.type === TransactionType.RENT_DUE ? <Receipt size={12} /> : <AlertCircle size={12} />}
                              {tx.type === TransactionType.RENT_PAYMENT ? 'Payment' : 
                               tx.type === TransactionType.RENT_DUE ? 'Rent Due' : 'Charge'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-gray-900">
                           {tx.description || (
                             tx.type === TransactionType.RENT_PAYMENT ? 'Rent Payment' : 
                             tx.type === TransactionType.RENT_DUE ? 'Monthly Rent Charge' : 'Charge'
                           )}
                           {tx.deductionAmount ? (
                             <div className="text-xs text-rose-500 mt-0.5">
                               Includes deduction: {tx.deductionReason} (-₹{tx.deductionAmount})
                             </div>
                           ) : null}
                         </td>
                         <td className={`px-6 py-4 text-sm font-bold text-right
                           ${tx.type === TransactionType.RENT_PAYMENT ? 'text-emerald-600' : 'text-gray-900'}
                         `}>
                           {tx.type === TransactionType.RENT_PAYMENT ? '-' : '+'}
                           ₹{(tx.totalAmount + (tx.deductionAmount || 0)).toLocaleString()}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                   <Receipt size={48} className="mb-4 opacity-20" />
                   <p>No transaction history found for this tenant.</p>
                 </div>
               )}
            </div>
             
             {/* Modal Footer */}
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setSelectedTenantId(null)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;