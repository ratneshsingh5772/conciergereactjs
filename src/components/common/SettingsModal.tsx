import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateUserCurrency } from '../../features/auth/authSlice';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCurrencyChange = async (currencyCode: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await dispatch(updateUserCurrency({ userId: user.id, currencyCode })).unwrap();
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog 
      open 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-none w-full h-full m-0" 
      aria-labelledby="settings-title"
    >
      <button 
        type="button"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm border-none w-full h-full cursor-default" 
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 id="settings-title" className="text-lg font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500" aria-label="Close settings">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <fieldset className="w-full">
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Currency Preference
            </legend>
            <p className="text-xs text-gray-500 mb-3">
              Select your preferred currency for display across the application.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  disabled={loading}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    user?.currencyCode === currency.code
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 font-serif text-lg">
                      {currency.symbol}
                    </span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{currency.name}</div>
                      <div className="text-xs text-gray-500">{currency.code}</div>
                    </div>
                  </div>
                  {user?.currencyCode === currency.code && (
                    <div className="text-blue-600">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SettingsModal;
