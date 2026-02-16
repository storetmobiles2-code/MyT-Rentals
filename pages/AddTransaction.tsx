import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { User, Plus, Trash2, PenTool, CheckCircle, Split, CheckCircle2 } from 'lucide-react';
import { TransactionType, TransactionSplit } from '../types';

const AddTransaction: React.FC = () => {
  const { tenants, addTransaction } = useData();
  const navigate = useNavigate();

  // Basic Details
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Money
  const [cashAmount, setCashAmount] = useState<number>(0);
  
  // Deductions (Repair)
  const [hasDeduction, setHasDeduction] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('');

  // Splits
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<TransactionSplit[]>([{ receiverName: 'Owner A', amount: 0 }]);

  // Auto-fill rent amount when tenant selected
  useEffect(() => {
    if (selectedTenantId) {
      const tenant = tenants.find(t => t.id === selectedTenantId);
      if (tenant) {
        setCashAmount(tenant.monthlyRent);
        // Reset splits if amount changes
        if (!isSplit) {
          setSplits([{ receiverName: 'Owner A', amount: tenant.monthlyRent }]);
        }
      }
    }
  }, [selectedTenantId, tenants]);

  // Update splits automatically if not split, or ensure totals match
  useEffect(() => {
    if (!isSplit) {
      setSplits([{ receiverName: 'Primary Receiver', amount: cashAmount }]);
    }
  }, [cashAmount, isSplit]);

  const handleAddSplit = () => {
    setSplits([...splits, { receiverName: '', amount: 0 }]);
  };

  const handleRemoveSplit = (index: number) => {
    const newSplits = [...splits];
    newSplits.splice(index, 1);
    setSplits(newSplits);
  };

  const handleSplitChange = (index: number, field: keyof TransactionSplit, value: string | number) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const totalSplitAmount = splits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const splitError = isSplit && totalSplitAmount !== cashAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (splitError) return;

    addTransaction({
      tenantId: selectedTenantId,
      type: TransactionType.RENT_PAYMENT,
      date,
      totalAmount: cashAmount,
      splits: splits,
      deductionAmount: hasDeduction ? deductionAmount : 0,
      deductionReason: hasDeduction ? deductionReason : undefined,
    });

    navigate('/transactions');
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Record Rent Payment</h1>
        <p className="text-gray-500">Log incoming payments, repairs, and splits.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tenant Selection Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
          <div className="relative">
             <select 
               required
               className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none"
               value={selectedTenantId}
               onChange={e => setSelectedTenantId(e.target.value)}
             >
               <option value="" disabled>Choose a tenant...</option>
               {tenants.map(t => (
                 <option key={t.id} value={t.id}>{t.name} ({t.propertyId})</option>
               ))}
             </select>
             <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
          </div>
          {selectedTenant && (
            <div className="mt-3 flex gap-4 text-sm">
               <span className={`font-medium ${selectedTenant.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                 Current Balance: {selectedTenant.currentBalance > 0 ? `Due ₹${selectedTenant.currentBalance}` : `Adv ₹${Math.abs(selectedTenant.currentBalance)}`}
               </span>
               <span className="text-gray-500">Monthly Rent: ₹{selectedTenant.monthlyRent}</span>
            </div>
          )}
        </div>

        {/* Payment Amount */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Received (₹)</label>
              <input 
                type="number" 
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900"
                value={cashAmount}
                onChange={e => setCashAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Deductions Toggle */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-orange-100 text-orange-600 rounded">
                 <PenTool size={16} />
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">Repair Deduction?</h3>
                 <p className="text-xs text-gray-500">Did the tenant pay for repairs directly?</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hasDeduction} onChange={e => setHasDeduction(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {hasDeduction && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={deductionAmount}
                  onChange={e => setDeductionAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Plumber repair"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={deductionReason}
                  onChange={e => setDeductionReason(e.target.value)}
                />
              </div>
              <div className="col-span-full">
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                  Total Credit to Tenant: <span className="font-bold">₹{cashAmount + deductionAmount}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Splits Toggle */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded">
                 <Split size={16} />
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">Split Payment?</h3>
                 <p className="text-xs text-gray-500">Distribute cash received to multiple owners.</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isSplit} onChange={e => setIsSplit(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {isSplit && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {splits.map((split, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Receiver Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={split.receiverName}
                      onChange={e => handleSplitChange(idx, 'receiverName', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      value={split.amount}
                      onChange={e => handleSplitChange(idx, 'amount', Number(e.target.value))}
                    />
                  </div>
                  {splits.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSplit(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mb-0.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddSplit}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-2"
              >
                <Plus size={16} /> Add Split Receiver
              </button>

              <div className={`mt-4 p-3 rounded-lg flex justify-between items-center text-sm ${splitError ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'}`}>
                <span>Total Split: ₹{totalSplitAmount}</span>
                {splitError ? (
                  <span className="font-bold">Must equal ₹{cashAmount}</span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle2 size={16}/> Matches Cash</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="flex-1 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!selectedTenantId || (isSplit && splitError)}
            className={`flex-1 py-3 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all
              ${(!selectedTenantId || (isSplit && splitError)) 
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-600/40'}
            `}
          >
            Confirm Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;