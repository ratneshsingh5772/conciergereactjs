import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboardStats } from './dashboardSlice';
import { fetchBudgets, createCategoryBudget, createTotalBudget, updateBudget, fetchCategories } from '../budget/budgetSlice';
import { Loader2, TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowLeft, Plus, Settings } from 'lucide-react';
import BudgetModal from '../budget/BudgetModal';
import type { BudgetPeriod, Budget } from '../budget/types';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);
  const { budgets, categories } = useAppSelector((state) => state.budget);
  
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchBudgets('MONTHLY'));
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSaveBudget = async (formData: { categoryName?: string; budgetAmount: number; budgetPeriod: BudgetPeriod; alertThreshold: number; isTotalBudget: boolean }) => {
    if (editingBudget) {
      await dispatch(updateBudget({
        id: editingBudget.id,
        data: {
          budgetAmount: formData.budgetAmount,
          budgetPeriod: formData.budgetPeriod,
          alertThreshold: formData.alertThreshold
        }
      }));
    } else if (formData.isTotalBudget) {
      await dispatch(createTotalBudget({
        budgetAmount: formData.budgetAmount,
        budgetPeriod: formData.budgetPeriod,
        alertThreshold: formData.alertThreshold
      }));
    } else {
      await dispatch(createCategoryBudget({
        categoryName: formData.categoryName,
        budgetAmount: formData.budgetAmount,
        budgetPeriod: formData.budgetPeriod,
        alertThreshold: formData.alertThreshold
      }));
    }
    // Refresh data
    dispatch(fetchDashboardStats());
    dispatch(fetchBudgets('MONTHLY'));
  };

  const openEditBudget = (categoryName: string) => {
    const budget = budgets.find(b => b.categoryName === categoryName);
    if (budget) {
      setEditingBudget(budget);
      setIsBudgetModalOpen(true);
    } else {
      // Pre-fill for new budget
      setEditingBudget(null); // Reset editing state
      // You might want to pass initial category name to modal if needed
      setIsBudgetModalOpen(true);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Use fetched categories if available, otherwise fallback to dashboard data
  const availableCategories = categories.length > 0 
    ? categories.map(c => c.name) 
    : data.categoryBreakdown.map(c => c.categoryName);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="p-2 md:p-2.5 bg-white hover:bg-slate-100 rounded-full shadow-sm border border-slate-200 transition-all duration-200 group shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Track your spending and manage your budget</p>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <span className="md:hidden text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <button 
            onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Set Budget</span>
          </button>

          <span className="hidden md:block px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 shadow-sm border border-slate-200">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Spent Card */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              data.monthOverMonthChange > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {data.monthOverMonthChange > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(data.monthOverMonthChange)}%
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">${data.totalSpentThisMonth.toFixed(2)}</h3>
            <p className="text-xs text-slate-400 mt-2">vs last month</p>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-violet-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-violet-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{data.transactionCount}</h3>
            <p className="text-xs text-slate-400 mt-2">in current period</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Budget Status */}
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Budget Status</h2>
            <button 
              onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Manage Budgets
            </button>
          </div>
          <div className="space-y-8">
            {data.budgetStatus.map((budget) => (
              <button 
                key={budget.categoryName} 
                className="w-full text-left group cursor-pointer block" 
                onClick={() => openEditBudget(budget.categoryName)}
                type="button"
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                      {budget.categoryIcon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        {budget.categoryName}
                        <Settings className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-sm text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">${budget.spent.toFixed(0)}</span>
                        <span className="mx-1">/</span>
                        ${budget.budgetLimit.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${budget.isOverBudget ? 'text-red-600' : 'text-slate-600'}`}>
                      {Math.min(budget.percentageUsed, 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out w-(--width) ${
                      budget.isOverBudget 
                        ? 'bg-linear-to-r from-red-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                        : 'bg-linear-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    }`} 
                    style={{ '--width': `${Math.min(budget.percentageUsed, 100)}%` } as React.CSSProperties}
                  ></div>
                </div>
                <div className="flex justify-end mt-2">
                    <span className={`text-xs font-medium ${budget.isOverBudget ? 'text-red-500' : 'text-slate-400'}`}>
                        {budget.isOverBudget ? `Over by $${Math.abs(budget.remaining).toFixed(0)}` : `${budget.remaining.toFixed(0)} remaining`}
                    </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 md:p-8 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6">Top Categories</h2>
          <div className="space-y-5">
            {data.categoryBreakdown.map((cat) => (
              <div key={cat.categoryName} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-200 group cursor-default">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200 bg-(--bg-color) text-(--text-color)" 
                    style={{ '--bg-color': `${cat.categoryColor}15`, '--text-color': cat.categoryColor } as React.CSSProperties}
                  >
                    {cat.categoryIcon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{cat.categoryName}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{cat.transactionCount} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${cat.totalAmount.toFixed(0)}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">Recent Transactions</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 md:px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-6 md:px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Description</th>
                <th className="px-6 md:px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-6 md:px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                  <td className="px-6 md:px-8 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <p className="text-sm font-semibold text-slate-900 min-w-37.5">{expense.description}</p>
                    {expense.originalMessage && (
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">"{expense.originalMessage}"</p>
                    )}
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
                      {expense.categoryIcon} {expense.categoryName}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-5 text-right">
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      -${expense.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleSaveBudget}
        initialData={editingBudget || undefined}
        categories={availableCategories}
      />
    </div>
  );
};

export default DashboardPage;
