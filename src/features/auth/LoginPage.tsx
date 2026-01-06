import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login } from './authSlice';
import { Lock, Mail, Loader2, Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ 
      credentials: { usernameOrEmail, password },
      rememberMe 
    }));
    if (login.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="flex flex-col md:flex-row w-full max-w-400 mx-auto relative z-10 min-h-screen">
            
            {/* Left Panel: Brand & Vision */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 text-white relative">
                 <div className="absolute top-8 left-8 md:top-16 md:left-16 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-white to-indigo-200">RUDRA AI</span>
                 </div>

                 <div className="max-w-xl space-y-8 mt-12 md:mt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        <span>Next Gen Financial Intelligence</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Master Your<br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                            Digital Wealth
                        </span>
                    </h1>
                    
                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Rudra AI is your autonomous financial concierge. We leverage advanced predictive models to forecast trends, optimize spending, and secure your financial future—all in real-time.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                            <span className="text-slate-300 text-sm">Real-time Analysis</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                            <span className="text-slate-300 text-sm">Predictive Forecasting</span>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-12 lg:p-24 relative">
                <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-black/20 relative overflow-hidden group">
                    
                    {/* Decorative header gradient */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500"></div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Access your secure financial dashboard</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="username" className="text-sm font-medium text-slate-700 ml-1">Username or Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Enter your email"
                                        value={usernameOrEmail}
                                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-slate-50"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)} 
                                />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500 bg-transparent border-none p-0 cursor-pointer">Forgot password?</button>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.99] group"
                        >
                            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-size-[200%_100%] animate-gradient" />
                            <span className="relative flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-500">
                                Not a member yet?{' '}
                                <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Create free account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
                
                {/* Footer/Copy */}
                <p className="absolute bottom-8 text-slate-500 text-xs font-medium tracking-wide">
                    © 2024 RUDRA AI. Secure Environment.
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
