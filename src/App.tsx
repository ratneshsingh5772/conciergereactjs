import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { BrainCircuit } from 'lucide-react';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const CategoriesPage = lazy(() => import('./features/categories/CategoriesPage'));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'));

// Rudra AI Themed Loading Screen
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
     {/* Background Ambient Glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
    </div>
    
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-cyan-500 blur-xl rounded-full opacity-20 animate-pulse" />
        <div className="relative bg-slate-800/80 p-5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
           <BrainCircuit className="w-10 h-10 text-emerald-400 animate-pulse" /> 
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
