import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-bg-card dark:bg-[#242622] border border-sand/20 dark:border-white/5 rounded-[32px] shadow-sm transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-8 border-b border-sand/10 dark:border-white/5 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-serif text-2xl font-bold text-ink dark:text-[#E4E3DA] ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; 
}) => {
  const variants = {
    primary: 'bg-olive-dark text-white hover:bg-olive-dark/90 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-sand text-white hover:bg-sand/90 shadow-md hover:shadow-lg active:scale-95',
    outline: 'border-2 border-sand/30 text-olive-dark dark:text-sand hover:bg-sand/10 active:scale-95',
    ghost: 'text-muted hover:bg-sand/5 hover:text-ink dark:hover:text-[#E4E3DA] active:scale-95',
    danger: 'bg-terracotta text-white hover:bg-terracotta/90 shadow-md hover:shadow-lg active:scale-95'
  };

  return (
    <button 
      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ 
  className = '', 
  label,
  id,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="flex flex-col space-y-2 w-full">
    {label && <label htmlFor={id} className="text-sm font-bold text-muted dark:text-muted ml-1 uppercase tracking-wider">{label}</label>}
    <input 
      id={id}
      className={`w-full bg-white dark:bg-[#1A1C18] border-2 border-sand/20 dark:border-white/10 rounded-2xl px-5 py-4 text-ink dark:text-[#E4E3DA] placeholder:text-muted/50 focus:outline-none focus:border-sand transition-all duration-300 ${className}`}
      {...props}
    />
  </div>
);

export const Select = ({ 
  options, 
  className = '', 
  label,
  id,
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; label?: string }) => (
  <div className="flex flex-col space-y-2 w-full">
    {label && <label htmlFor={id} className="text-sm font-bold text-muted dark:text-muted ml-1 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      <select 
        id={id}
        className={`w-full bg-white dark:bg-[#1A1C18] border-2 border-sand/20 dark:border-white/10 rounded-2xl px-5 py-4 text-ink dark:text-[#E4E3DA] focus:outline-none focus:border-sand transition-all duration-300 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#242622] text-ink dark:text-[#E4E3DA]">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);
