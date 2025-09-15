import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  themeColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  themeColor = 'blue', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  // Base classes for all button styles.
  const baseClasses = "font-semibold rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out inline-flex items-center justify-center";

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-7 py-2.5 text-base',
  };

  const colorClasses = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-sky-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
  };
  
  const variantClass = colorClasses[variant];

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
