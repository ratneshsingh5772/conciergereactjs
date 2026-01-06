import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { getCurrencySymbol } from '../../utils/currencyFormatter';
import type { BudgetPeriod } from './types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { categoryName?: string; budgetAmount: number; budgetPeriod: BudgetPeriod; alertThreshold: number; isTotalBudget: boolean }) => void;
  initialData?: {
    categoryName?: string;
    budgetAmount: number;
    budgetPeriod: BudgetPeriod;
    alertThreshold: number;
    isTotalBudget: boolean;
  };
  categories: string[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSubmit, initialData, categories }) => {
  const user = useAppSelector((state) => state.auth.user);
  const [isTotalBudget, setIsTotalBudget] = useState(initialData?.isTotalBudget || false);
  const [categoryName, setCategoryName] = useState(initialData?.categoryName || categories[0] || '');
  const [amount, setAmount] = useState(initialData?.budgetAmount?.toString() || '');
  const [period, setPeriod] = useState<BudgetPeriod>(initialData?.budgetPeriod || 'MONTHLY');
  const [threshold, setThreshold] = useState(initialData?.alertThreshold?.toString() || '80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      isTotalBudget,
      categoryName: isTotalBudget ? undefined : categoryName,
      budgetAmount: Number.parseFloat(amount),
      budgetPeriod: period,
      alertThreshold: Number.parseFloat(threshold),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Budget' : 'Set New Budget'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors" aria-label="Close modal">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Budget Type Toggle */}
          {!initialData && (
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isTotalBudget ? 'text-slate-500 hover:text-slate-700' : 'bg-white shadow-sm text-slate-900'}`}
                onClick={() => setIsTotalBudget(false)}
              >
                Category Budget
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isTotalBudget ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setIsTotalBudget(true)}
              >
                Total Budget
              </button>
            </div>
          )}

          {/* Category Selection */}
          {!isTotalBudget && (
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                id="category-select"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!!initialData} // Disable changing category on edit
                title="Select Category"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div>
            <label htmlFor="budget-amount" className="block text-sm font-medium text-slate-700 mb-1">Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getCurrencySymbol(user?.currencyCode)}</span>
              <input
                id="budget-amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Period */}
          <div>
            <label htmlFor="budget-period" className="block text-sm font-medium text-slate-700 mb-1">Period</label>
            <select
              id="budget-period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              title="Select Budget Period"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          {/* Alert Threshold */}
          <div>
            <label htmlFor="alert-threshold" className="block text-sm font-medium text-slate-700 mb-1">
              Alert Threshold (%) <span className="ml-2 text-xs text-slate-400 font-normal">Notify when usage reaches this %</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                id="alert-threshold"
                type="range"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                title="Alert Threshold Slider"
              />
              <span className="w-12 text-right font-medium text-slate-700">{threshold}%</span>
            </div>
          </div>

          {/* Info Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              The AI assistant will automatically use this budget to track your spending and send alerts.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
