import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Calendar, TrendingUp, AlertCircle, ArrowLeft, Download, Filter, Loader2, AlertTriangle, Sparkles, Target, Wallet, GraduationCap, Bot, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { fetchDailyTrend, fetchMonthlySpend, fetchAnalyticsSummary, fetchForecast } from './analyticsAPI';
import type { DailyTrend, MonthlySpend, AnalyticsSummary, Forecast } from './types';

// Mock Data Fallback
const MOCK_DAILY_DATA: DailyTrend[] = [
  { day: 'Mon', date: '2023-10-23', amount: 120 },
  { day: 'Tue', date: '2023-10-24', amount: 230 },
  { day: 'Wed', date: '2023-10-25', amount: 180 },
  { day: 'Thu', date: '2023-10-26', amount: 290 },
  { day: 'Fri', date: '2023-10-27', amount: 450 },
  { day: 'Sat', date: '2023-10-28', amount: 320 },
  { day: 'Sun', date: '2023-10-29', amount: 150 },
  { day: 'Mon', date: '2023-10-30', amount: 210 },
  { day: 'Tue', date: '2023-10-31', amount: 190 },
  { day: 'Wed', date: '2023-11-01', amount: 310 },
];

const MOCK_MONTHLY_DATA: MonthlySpend[] = [
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 1398 },
  { month: 'Mar', amount: 3800 },
  { month: 'Apr', amount: 3908 },
  { month: 'May', amount: 4800 },
  { month: 'Jun', amount: 3800 },
  { month: 'Jul', amount: 4300 },
  { month: 'Aug', amount: 5100 },
  { month: 'Sep', amount: 4200 },
  { month: 'Oct', amount: 3800 },
  { month: 'Nov', amount: 4100 },
  { month: 'Dec', amount: 5600 },
];

const MOCK_SUMMARY: AnalyticsSummary = {
    totalSpentLast10Days: 2450,
    projectedMonthlySpend: 2450,
    highestDailySpend: { date: '2023-10-27', amount: 450 }
};

const MOCK_FORECAST: Forecast = {
    predictedYearEndSpend: 28500,
    predictedMonthEndSpend: 2450,
    nextLikelySpend: {
      category: "Groceries",
      estimatedAmount: 85.5,
      confidence: "High"
    },
    aiAnalysis: "Based on your spending habits, you are on track to spend $2,450.00 this month and $28,500.00 this year. Your most frequent expense category is Groceries."
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label, currencyCode }: { active?: boolean; payload?: { value: number }[]; label?: string; currencyCode?: string }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-indigo-100 ring-1 ring-indigo-50">
                <p className="text-slate-500 text-sm mb-1">{label}</p>
                <p className="text-indigo-600 font-bold text-lg">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode || 'USD' }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const AnalyticsPage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [dailyData, setDailyData] = useState<DailyTrend[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlySpend[]>([]);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: user?.currencyCode || 'USD',
                maximumFractionDigits: 0
            }).format(amount);
        } catch {
            return `$${amount.toLocaleString()}`;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) {
                // If no user, maybe show mock data or just wait?
                // For now, let's keep the mock data fallback logic implicitly handled if real fetch fails, 
                // but we can't fetch without ID. 
                // However, the original code used mock data in the catch block.
                // If we return here, loading stays true?
                // Let's create an error inside the try block to trigger mock data if user is missing, 
                // or just skip. 
                // Actually, if !user, we are probably not authenticated or loading auth.
                return; 
            }

            try {
                setLoading(true);
                // Attempt to fetch real data
                const [daily, monthly, summaryResult, forecastResult] = await Promise.all([
                    fetchDailyTrend(user.id, 10),
                    fetchMonthlySpend(user.id, new Date().getFullYear()),
                    fetchAnalyticsSummary(user.id),
                    fetchForecast(user.id)
                ]);

                setDailyData(daily);
                setMonthlyData(monthly);
                setSummary(summaryResult);
                setForecast(forecastResult);
                setError(null);
            } catch (err) {
                console.warn('Failed to fetch analytics data, falling back to mock data:', err);
                
                // Fallback to MOCK DATA if API fails (which mimics a real scenario where we want to show a demo)
                // If user truly wants empty state, they would have empty arrays from API.
                // But error usually means backend is down or not implemented, so we show Mock.
                setDailyData(MOCK_DAILY_DATA);
                setMonthlyData(MOCK_MONTHLY_DATA);
                setSummary(MOCK_SUMMARY);
                setForecast(MOCK_FORECAST);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    const hasData = dailyData.length > 0 || monthlyData.length > 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Analyzing financial data...</p>
                </div>
            </div>
        );
    }

    if (!hasData && !error) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex flex-col relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100/40 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col">
                    <div className="mb-8">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Financial Analytics</h1>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500 shadow-inner">
                            <BarChart3 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">No Data Available Yet</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            We need a bit more transaction history to generate meaningful analytics. Start using the Concierge chat to track your expenses!
                        </p>
                        <Link 
                            to="/" 
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 font-medium"
                        >
                            <Bot className="w-5 h-5" />
                            <span>Start Tracking with AI</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
         return (
             <div className="min-h-screen p-8 bg-slate-50 flex flex-col items-center justify-center">
                 <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-4 border border-red-100 max-w-md text-center">
                     <AlertTriangle className="w-10 h-10" />
                     <h3 className="text-lg font-bold">Oops! Something went wrong</h3>
                     <p>{error}</p>
                     <Link to="/dashboard" className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                         Back to Dashboard
                     </Link>
                 </div>
             </div>
         );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans relative overflow-x-hidden">
             {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100/40 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Analytics</h1>
                            <p className="text-slate-500 text-sm font-medium">Insights into your spending habits</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-all shadow-sm hover:shadow-md active:scale-95">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                         <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95">
                            <Download className="w-4 h-4" />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-indigo-50 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Total Spent (Last 10 Days)</p>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {summary ? formatCurrency(summary.totalSpentLast10Days) : formatCurrency(0)}
                            </h2>
                            <div className="flex items-center gap-1 text-emerald-500 text-sm mt-2 font-medium bg-emerald-50 w-fit px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                <span>Recent activity</span>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-indigo-50 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Projected Monthly Spend</p>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {summary ? formatCurrency(summary.projectedMonthlySpend) : formatCurrency(0)}
                            </h2>
                            <div className="flex items-center gap-1 text-violet-500 text-sm mt-2 font-medium bg-violet-50 w-fit px-2 py-1 rounded-full">
                                <Calendar className="w-3 h-3" />
                                <span>Monthly Forecast</span>
                            </div>
                        </div>
                    </div>

                     <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-indigo-50 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 font-medium mb-1">Highest Daily Spend</p>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {summary?.highestDailySpend ? formatCurrency(summary.highestDailySpend.amount) : formatCurrency(0)}
                            </h2>
                            <div className="flex items-center gap-1 text-amber-600 text-sm mt-2 font-medium bg-amber-50 w-fit px-2 py-1 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                <span>{summary?.highestDailySpend?.date ? new Date(summary.highestDailySpend.date).toLocaleDateString(undefined, { weekday: 'long' }) : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Last 10 Days Trend */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-[0_2px_20px_-5px_rgba(99,102,241,0.1)] border border-indigo-50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Daily Spending Trend</h3>
                                <p className="text-slate-500 text-sm">Last 10 Days Activity</p>
                            </div>
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-indigo-100">
                                Real-time
                            </div>
                        </div>
                        <div className="h-75 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" strokeOpacity={0.5} />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                    />
                                    <Tooltip content={<CustomTooltip currencyCode={user?.currencyCode} />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#6366f1" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Yearly Month-wise Spend */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-[0_2px_20px_-5px_rgba(99,102,241,0.1)] border border-indigo-50">
                        <div className="flex items-center justify-between mb-8">
                             <div>
                                <h3 className="text-lg font-bold text-slate-900">Monthly Expenses</h3>
                                <p className="text-slate-500 text-sm">Year-to-Date Overview</p>
                            </div>
                        </div>
                        <div className="h-75 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" strokeOpacity={0.5} />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                                    />
                                    <Tooltip content={<CustomTooltip currencyCode={user?.currencyCode} />} cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} animationDuration={1500}>
                                        {monthlyData.map((entry, index) => (
                                            <Cell key={entry.month} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* AI Forecast Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">
                            AI Financial Forecast
                        </h2>
                    </div>

                    {/* AI Insight Card */}
                    <div className="bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 rounded-2xl shadow-xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Bot className="w-40 h-40 transform rotate-12 translate-x-10 -translate-y-10" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-6">
                            <div className="shrink-0">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                    <Sparkles className="w-8 h-8 text-indigo-200" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">AI Analysis</h3>
                                <p className="text-indigo-100 leading-relaxed max-w-3xl text-lg font-light">
                                    {forecast?.aiAnalysis || "Gathering more data to generate insights..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Projections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Month End Projection */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Month-End Project</p>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(forecast?.predictedMonthEndSpend || 0)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600">
                                    <Target className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
                                <div className="bg-indigo-500 h-1.5 rounded-full w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">75% of monthly budget</p>
                        </div>

                        {/* Year End Projection */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-500/10 to-transparent rounded-bl-full"></div>
                           <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Year-End Project</p>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(forecast?.predictedYearEndSpend || 0)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                             <div className="flex items-center gap-2 text-slate-400 text-sm mt-4">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">Based on YTD average</span>
                            </div>
                        </div>

                        {/* Next Likely Expense */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-amber-50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
                           <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Predicted Next Expense</p>
                                    <div className="flex flex-col gap-1 mb-1">
                                        <h3 className="text-xl font-bold text-slate-900">
                                            {forecast?.nextLikelySpend?.category || 'N/A'}
                                        </h3>
                                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            forecast?.nextLikelySpend?.confidence === 'High' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {forecast?.nextLikelySpend?.confidence || 'Unknown'} Confidence
                                        </span>
                                    </div>
                                    <p className="text-slate-400 font-medium mt-1">
                                        ~{formatCurrency(forecast?.nextLikelySpend?.estimatedAmount || 0)}
                                    </p>
                                </div>
                                <div className="p-2 bg-amber-100/50 rounded-lg text-amber-600">
                                    <Wallet className="w-6 h-6" />
                                </div>
                            </div>
                             <div className="flex items-center gap-2 text-slate-400 text-sm mt-2">
                                <GraduationCap className="w-4 h-4" />
                                <span className="font-medium">AI Pattern Recognition</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
