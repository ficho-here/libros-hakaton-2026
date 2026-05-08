type LogoProps = {
  className?: string;
  idPrefix?: string;
};

export function SolanaLogo({ className = "", idPrefix = "solanaLogo" }: LogoProps) {
  const topGradientId = `${idPrefix}Top`;
  const middleGradientId = `${idPrefix}Middle`;
  const bottomGradientId = `${idPrefix}Bottom`;

  return (
    <svg
      className={className}
      viewBox="0 0 397 311"
      role="img"
      aria-label="Solana logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={topGradientId} x1="360" x2="40" y1="20" y2="140">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id={middleGradientId} x1="40" x2="360" y1="110" y2="210">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id={bottomGradientId} x1="360" x2="40" y1="200" y2="300">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path
        d="M64 38c4-4 10-6 16-6h290c10 0 15 12 8 19l-45 45c-4 4-10 6-16 6H27c-10 0-15-12-8-19l45-45Z"
        fill={`url(#${topGradientId})`}
      />
      <path
        d="M333 132c-4-4-10-6-16-6H27c-10 0-15 12-8 19l45 45c4 4 10 6 16 6h290c10 0 15-12 8-19l-45-45Z"
        fill={`url(#${middleGradientId})`}
      />
      <path
        d="M64 226c4-4 10-6 16-6h290c10 0 15 12 8 19l-45 45c-4 4-10 6-16 6H27c-10 0-15-12-8-19l45-45Z"
        fill={`url(#${bottomGradientId})`}
      />
    </svg>
  );
}

export function FfosLogo({ className = "" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 180"
      role="img"
      aria-label="FFOS logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="180" height="180" fill="#ffffff" />
      <path
        d="M13 51h76L77 68H29c-7 0-12 5-12 12v43c0 7 5 12 12 12h55v17H14c-8 0-14-6-14-14V65c0-8 6-14 13-14Zm114 0h39c8 0 14 6 14 14v73c0 8-6 14-14 14h-62l14-17h34c7 0 12-5 12-12V80c0-7-5-12-12-12h-37l12-17Z"
        fill="#68BD45"
      />
      <path
        d="M113 0 76 92h38l-23 79 64-101h-36l22-70h-28Z"
        fill="#126BB4"
      />
      <path
        d="M118 132h-20l22-22v13h42v18h-42v27h-22v-27H78l20-9h20Z"
        fill="#68BD45"
      />
      <g fill="#126BB4">
        <rect x="119" y="3" width="8" height="8" transform="rotate(17 123 7)" />
        <rect x="135" y="0" width="8" height="8" transform="rotate(17 139 4)" />
        <rect x="111" y="18" width="8" height="8" transform="rotate(17 115 22)" />
        <rect x="127" y="15" width="8" height="8" transform="rotate(17 131 19)" />
        <rect x="143" y="12" width="8" height="8" transform="rotate(17 147 16)" />
        <rect x="119" y="31" width="8" height="8" transform="rotate(17 123 35)" />
        <rect x="135" y="28" width="8" height="8" transform="rotate(17 139 32)" />
      </g>
    </svg>
  );
}

export function ElprosLogo({ className = "" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 270 160"
      role="img"
      aria-label="ELPROS logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="270" height="160" fill="#ffffff" />
      <path
        d="M112 17 39 80l78 66 45-40-18-18-28 25-38-33 48-42 48 42-18 18"
        fill="none"
        stroke="#42515A"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="9"
      />
      <path
        d="M150 17 231 80l-78 66-44-40 18-18 28 25 38-33-48-42-48 42 18 18"
        fill="none"
        stroke="#B72026"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="9"
      />
    </svg>
  );
}
