import React from "react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtextClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "flex items-center gap-3",
  iconClassName = "w-10 h-10",
  textClassName = "text-white text-lg",
  subtextClassName = "text-zinc-400",
}) => {
  return (
    <div className={className}>
      {/* Logo Icon */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconClassName}
      >
        <defs>
          <filter id="green-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Document outline */}
        <path
          d="M12 5C10.8954 5 10 5.89543 10 7V41C10 42.1046 10.8954 43 12 43H36C37.1046 43 38 42.1046 38 41V13L30 5H12Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-400 dark:text-zinc-600"
        />
        {/* Folded corner */}
        <path
          d="M30 5V13H38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-400 dark:text-zinc-600"
        />
        
        {/* Horizontal text lines */}
        <line x1="16" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500 dark:text-zinc-700" opacity="0.5" />
        <line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500 dark:text-zinc-700" opacity="0.5" />
        <line x1="16" y1="30" x2="26" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500 dark:text-zinc-700" opacity="0.5" />
        <line x1="16" y1="36" x2="28" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500 dark:text-zinc-700" opacity="0.5" />

        {/* X-Ray cross (Glowing Green) */}
        <path
          d="M13 15L35 37M35 15L13 37"
          stroke="#10b981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#green-glow)"
        />
        {/* Center bright dot */}
        <circle
          cx="24"
          cy="26"
          r="3.5"
          fill="#34d399"
          filter="url(#green-glow)"
        />
      </svg>
      <div>
        <h1 className={`font-extrabold tracking-tight font-sans flex items-center gap-0.5 ${textClassName}`}>
          INVOICE<span className="text-emerald-500 dark:text-emerald-400">X-RAY</span>
        </h1>
        <span className={`text-[10px] font-sans block leading-tight ${subtextClassName}`}>
          AI-Powered Trade Finance Compliance
        </span>
      </div>
    </div>
  );
};
