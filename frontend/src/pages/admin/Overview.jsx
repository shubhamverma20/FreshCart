import React from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const salesData = [
  { name: '1 Jul', sales: 4000 },
  { name: '5 Jul', sales: 3000 },
  { name: '10 Jul', sales: 5000 },
  { name: '15 Jul', sales: 2780 },
  { name: '20 Jul', sales: 6890 },
  { name: '25 Jul', sales: 8390 },
  { name: '30 Jul', sales: 10490 },
];

const categoryData = [
  { name: 'Vegetables', value: 400 },
  { name: 'Dairy & Eggs', value: 300 },
  { name: 'Snacks', value: 300 },
  { name: 'Beverages', value: 200 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

export default function Overview() {
  const { theme } = useTheme();
  
  // Dynamic colors for recharts based on theme
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#f1f5f9';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';

  return (
    <div className="space-y-8">
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₹45,231', trend: '+12.5%', color: 'from-emerald-500/10 to-teal-500/5 text-emerald-600', icon: FiDollarSign },
          { label: 'Orders Today', value: '142', trend: '+8.4%', color: 'from-blue-500/10 to-indigo-500/5 text-blue-600', icon: FiShoppingBag },
          { label: 'Active Users', value: '892', trend: '+2.1%', color: 'from-purple-500/10 to-pink-500/5 text-purple-600', icon: FiUsers },
          { label: 'Avg Order Value', value: '₹318', trend: '-1.4%', color: 'from-amber-500/10 to-yellow-500/5 text-amber-600', icon: FiTrendingUp }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const isNegative = stat.trend.startsWith('-');
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className="font-display font-black text-2xl text-slate-850 dark:text-white">{stat.value}</div>
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isNegative ? 'bg-red-50 text-red-600 dark:bg-red-950/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'}`}>
                  {stat.trend} vs last period
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Sales Area Chart (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm text-left">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-primary w-4.5 h-4.5" /> Sales Trend (Last 30 Days)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[32px] shadow-sm text-left">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <FiPackage className="text-primary w-4.5 h-4.5" /> Category Sales
          </h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: textColor, fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend to match aesthetic */}
            <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
              {categoryData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
