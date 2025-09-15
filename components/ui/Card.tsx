import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cardClasses = `bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
