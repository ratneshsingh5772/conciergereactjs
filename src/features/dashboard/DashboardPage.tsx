import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboardStats } from './dashboardSlice';
import { fetchBudgets, createCategoryBudget, createTotalBudget, updateBudget, fetchCategories } from '../budget/budgetSlice';
import { Loader2, TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowLeft, Plus, Settings, Calendar } from 'lucide-react';
import BudgetModal from '../budget/BudgetModal';
import type { BudgetPeriod, Budget } from '../budget/types';
import type { BudgetStatus, CategoryBreakdown } from './types';

const BudgetCard = ({ budget, onClick }: { budget: BudgetStatus; onClick: () => void }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--width', `${Math.min(budget.percentageUsed, 100)}%`);
    }
  }, [budget.percentageUsed]);

  return (
    <button 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer group text-left w-full"
    >
      <div className="flex justify-between items-start mb-3 w-full">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
            {budget.categoryIcon}
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full border ${budget.isOverBudget ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            {Math.min(budget.percentageUsed, 100).toFixed(0)}%
        </div>
      </div>
      
      <div className="w-full mb-3">
        <h4 className="font-semibold text-slate-900 mb-1 truncate flex items-center gap-2">
            {budget.categoryName}
            <Settings className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h4>
        <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">${budget.spent.toFixed(0)}</span>
            <span className="mx-1 text-slate-300">/</span>
            ${budget.budgetLimit.toFixed(0)}
        </p>
      </div>

      <div className="w-full">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
            <div 
            ref={progressRef}
            className={`h-full rounded-full transition-all duration-1000 ease-out w-(--width) ${
                budget.isOverBudget 
                ? 'bg-linear-to-r from-red-500 to-red-600' 
                : 'bg-linear-to-r from-indigo-500 to-violet-500'
            }`} 
            ></div>
        </div>
        <p className={`text-xs font-medium ${budget.isOverBudget ? 'text-red-500' : 'text-slate-400'}`}>
            {budget.isOverBudget ? `Over by $${Math.abs(budget.remaining).toFixed(0)}` : `${budget.remaining.toFixed(0)} left`}
        </p>
      </div>
    </button>
  );
};

const CategoryCard = ({ cat }: { cat: CategoryBreakdown }) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      iconRef.current.style.setProperty('--bg-color', `${cat.categoryColor}15`);
      iconRef.current.style.setProperty('--text-color', cat.categoryColor);
    }
  }, [cat.categoryColor]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full cursor-default group">
      <div className="flex justify-between items-start mb-3">
        <div 
          ref={iconRef}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-(--bg-color) text-(--text-color) group-hover:scale-110 transition-transform duration-200" 
        >
          {cat.categoryIcon}
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
          {cat.percentage.toFixed(0)}%
        </span>
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 mb-1 truncate" title={cat.categoryName}>{cat.categoryName}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-900">${cat.totalAmount.toFixed(0)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{cat.transactionCount} transactions</p>
      </div>
    </div>
  );
};


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
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 bg-white hover:bg-slate-100 rounded-full shadow-sm border border-slate-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
            <p className="text-slate-500 text-sm">Track your spending and manage your budget</p>
          </div>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Card 1: Total Spent */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-24 h-24 text-indigo-600" />
           </div>
           <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
                ${data.totalSpentThisMonth.toFixed(2)}
              </h3>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data.monthOverMonthChange > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {data.monthOverMonthChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(data.monthOverMonthChange)}% vs last month
              </div>
           </div>
        </div>

        {/* Card 2: Transactions & Date Context */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
                 <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{data.transactionCount}</h3>
              </div>
              <div className="p-3 bg-violet-50 rounded-xl">
                 <CreditCard className="w-6 h-6 text-violet-600" />
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Current Period</span>
           </div>
        </div>

        {/* Card 3: Budget Action Card */}
        <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
           
           <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Budget Management</h3>
              <p className="text-indigo-100 text-sm opacity-90">Set limits and track your financial goals.</p>
           </div>
           
           <button 
             onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }}
             className="relative z-10 mt-4 w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
           >
             <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
             Set New Budget
           </button>
        </div>
      </div>

      {/* Budget Status Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Budget Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.budgetStatus.map((budget) => (
            <BudgetCard 
              key={budget.categoryName} 
              budget={budget} 
              onClick={() => openEditBudget(budget.categoryName)} 
            />
          ))}
        </div>
      </div>

      {/* Top Categories Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Top Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.categoryBreakdown.map((cat) => (
            <CategoryCard key={cat.categoryName} cat={cat} />
          ))}
        </div>
      </div>

      {/* Recent Transactions (Full Width) */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900 truncate max-w-50">{expense.description}</p>
                    {expense.originalMessage && (
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">"{expense.originalMessage}"</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {expense.categoryIcon} {expense.categoryName}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900">-${expense.amount.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal */}
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
