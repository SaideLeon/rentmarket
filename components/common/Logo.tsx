import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-base', font: 24 },
    md: { box: 'w-9 h-9 md:w-10 md:h-10', text: 'text-lg md:text-xl', font: 32 },
    lg: { box: 'w-12 h-12', text: 'text-2xl', font: 40 },
    xl: { box: 'w-16 h-16', text: 'text-3xl', font: 56 },
  };

  const currentSize = sizeMap[size];

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src="/icon.svg"
          alt="Mussika Online Logo"
          className={`${currentSize.box} object-contain transition-transform hover:scale-105`}
        />
        {showText && (
          <div className="flex flex-col leading-none">
            <span className={`font-bold tracking-tight text-slate-900 ${currentSize.text}`}>
              Mussika <span className="text-emerald-600">Online</span>
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              Moçambique 🇲🇿
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-emerald-600 shadow-xs ${currentSize.box} ${className}`}>
      <img
        src="/icon.svg"
        alt="Mussika Online Icon"
        className="w-full h-full object-cover transition-transform hover:scale-105"
      />
    </div>
  );
};

export default Logo;
