import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

export const Badge = ({ children, variant = 'primary', className = '' }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'outline' | 'danger', className?: string }) => {
  const styles = {
    primary: 'bg-red-50 text-red-600 border border-red-100 font-bold',
    secondary: 'bg-slate-100 text-slate-600 border border-slate-200',
    danger: 'bg-red-50 text-red-600 border border-red-100', // Mapped to primary for consistency in this theme
    outline: 'bg-transparent text-slate-500 border border-slate-300',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs tracking-wide ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  size = 'md',
  icon: Icon,
  disabled = false,
  type = 'button'
}: { 
  children?: React.ReactNode, 
  onClick?: (e?: React.MouseEvent) => void, 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline', 
  className?: string,
  size?: 'sm' | 'md' | 'lg',
  icon?: React.ElementType,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset'
}) => {
  const base = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white relative overflow-hidden active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white focus:ring-red-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 btn-shine ripple-effect",
    secondary: "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white focus:ring-slate-500 shadow-md ripple-effect",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 hover:scale-105",
    outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''} transition-transform group-hover:scale-110`} />}
      {children}
    </button>
  );
};

export const ProfitPill = ({ price, value }: { price: number, value: number }) => {
  const profit = value - price;
  return (
    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md border border-red-100 px-3 py-1.5 rounded-full text-xs text-red-600 font-bold shadow-sm animate-pulse-slow">
       <TrendingUp className="w-3.5 h-3.5" />
       <span>+${profit.toLocaleString()} POTENTIAL</span>
    </div>
  );
};

export const ConfidenceBar = ({ score }: { score: number }) => {
  let color = 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600'; 

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5 font-semibold">
         <span className="text-slate-400 uppercase tracking-wider text-[10px]">AI Confidence</span>
         <span className="text-red-600 font-black">{score}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
         <div 
            className={`h-full ${color} shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-1000 ease-out relative overflow-hidden`} 
            style={{ width: `${score}%` }}
         >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
         </div>
      </div>
    </div>
  );
};