import React, { useState } from 'react';
import { X, Save, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import type { CreateCategoryRequest, Category } from './types';

const SUGGESTED_CATEGORIES = [
  { group: 'Housing & Utilities', emoji: '🏠', items: ['Rent / Home EMI', 'Maintenance Charges', 'Property Tax', 'Electricity Bill', 'Water Bill', 'Gas / LPG', 'Internet / Broadband', 'Mobile Recharge', 'Cable / DTH'] },
  { group: 'Food & Groceries', emoji: '🍽️', items: ['Groceries', 'Fruits & Vegetables', 'Milk & Dairy', 'Dining Out', 'Online Food Orders', 'Snacks & Beverages'] },
  { group: 'Transportation', emoji: '🚗', items: ['Fuel / Petrol / Diesel', 'Public Transport', 'Cab / Ride Sharing', 'Vehicle Maintenance', 'Parking Fees', 'Toll Charges'] },
  { group: 'Health & Medical', emoji: '🏥', items: ['Doctor Consultation', 'Medicines', 'Medical Tests', 'Health Insurance', 'Hospital Bills', 'Fitness / Gym'] },
  { group: 'Education', emoji: '📚', items: ['School / College Fees', 'Tuition / Coaching', 'Online Courses', 'Books & Study Material', 'Exam Fees'] },
  { group: 'Shopping', emoji: '🛍️', items: ['Clothing', 'Footwear', 'Accessories', 'Electronics', 'Personal Care', 'Salon / Grooming'] },
  { group: 'Entertainment', emoji: '🎉', items: ['Movies', 'OTT Subscriptions', 'Games', 'Events / Shows', 'Hobbies'] },
  { group: 'Digital Services', emoji: '🧾', items: ['OTT Platforms', 'Music Subscriptions', 'Cloud Storage', 'Software / Apps', 'News / Magazines'] },
  { group: 'Financial', emoji: '🏦', items: ['Loan EMI', 'Credit Card Bill', 'Bank Charges', 'Late Fees', 'Interest Payments'] },
  { group: 'Insurance', emoji: '🛡️', items: ['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance'] },
  { group: 'Gifts & Donations', emoji: '🎁', items: ['Gifts', 'Charity', 'Religious Contributions'] },
  { group: 'Household', emoji: '🧰', items: ['Cleaning Supplies', 'Home Repairs', 'Furniture', 'Appliances'] },
  { group: 'Travel', emoji: '✈️', items: ['Flights', 'Hotel / Stay', 'Local Transport', 'Sightseeing', 'Travel Insurance'] },
  { group: 'Work', emoji: '💼', items: ['Office Supplies', 'Work Tools', 'Internet for Work', 'Travel for Work'] },
  { group: 'Family', emoji: '👶', items: ['Child Education', 'Toys', 'Baby Care', 'Daycare'] },
  { group: 'Miscellaneous', emoji: '📦', items: ['Emergency Expenses', 'Unplanned Purchases', 'Others'] },
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => Promise<void>;
  initialData?: Category;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<CreateCategoryRequest>(() => 
    initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      icon: initialData.icon || '',
      color: initialData.color || '#3b82f6',
    } : {
      name: '',
      description: '',
      icon: '',
      color: '#3b82f6', // Default blue-500
    }
  );

  // Suggested Categories State
  const [showSuggestions, setShowSuggestions] = useState(false);

  const applySuggestion = (name: string, emoji: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      icon: emoji,
      // Attempt to auto-generate a description
      description: `Expenses related to ${name}`
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <dialog 
      open 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-none w-full h-full m-0"
      aria-labelledby="category-modal-title"
    >
      <button 
        type="button"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm border-none w-full h-full cursor-default" 
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h3 id="category-modal-title" className="text-lg font-bold text-gray-900">
            {initialData ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" 
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
            
            {/* Suggestion Toggle (Visible only for new categories) */}
            {!initialData && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
                <button 
                  type="button"
                  className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none p-0 text-left"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowSuggestions(!showSuggestions);
                    }
                  }}
                  aria-expanded={showSuggestions}
                  aria-controls="suggested-categories"
                >
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Need inspiration? View recommended categories</span>
                  </div>
                  {showSuggestions ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </button>

                 {/* Mobile Suggestions (Collapsible) */}
                {showSuggestions && (
                  <div className="mt-3 md:hidden border-t border-indigo-100 pt-3 max-h-48 overflow-y-auto">
                      {SUGGESTED_CATEGORIES.map((group) => (
                        <div key={group.group} className="mb-2">
                           <p className="text-xs font-bold text-indigo-800 mb-1">{group.emoji} {group.group}</p>
                           <div className="flex flex-wrap gap-2">
                             {group.items.map(item => (
                               <button
                                 key={item}
                                 type="button"
                                 onClick={() => applySuggestion(item, group.emoji)}
                                 className="text-xs bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100"
                               >
                                 {item}
                               </button>
                             ))}
                           </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g., Groceries"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="What kind of expenses go here?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Emoji)
                </label>
                <input
                  id="icon"
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g., 🍔"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color tag
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 p-0.5 rounded cursor-pointer border-0"
                  />
                  <span className="text-sm text-gray-500 font-mono uppercase">{formData.color}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {initialData ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>

          {/* Desktop Suggestions Sidebar */}
          {!initialData && showSuggestions && (
            <div className="hidden md:flex w-64 bg-slate-50 border-l border-slate-200 flex-col overflow-hidden transition-all">
                <div className="p-4 bg-white border-b border-slate-200">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Suggested Categories
                    </h4>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                  {SUGGESTED_CATEGORIES.map((group) => (
                    <div key={group.group} className="space-y-2">
                      <div className="text-xs font-bold text-slate-600">
                         <span className="flex items-center gap-1.5">
                            <span className="text-base">{group.emoji}</span> {group.group}
                         </span>
                      </div>
                      
                       <div className="flex flex-wrap gap-2">
                          {group.items.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => applySuggestion(item, group.emoji)}
                                className="text-[10px] bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-left truncate max-w-full"
                                title={item}
                            >
                                {item}
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        
        </div>
      </div>
    </dialog>
  );
};

export default CategoryModal;
