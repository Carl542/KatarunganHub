export default function BrandMark({ size = 60 }) {
  const id = `barangay-seal-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="KatarunganHub barangay seal"
      className="brand-mark"
    >
      <defs>
        <path id={`${id}-top`} d="M20 60a40 40 0 0 1 80 0" />
        <path id={`${id}-bottom`} d="M100 60a40 40 0 0 1-80 0" />
        <clipPath id={`${id}-shield`}>
          <path d="M38 36h44v30c0 17.5-13.8 28.8-22 33-8.2-4.2-22-15.5-22-33V36Z" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="57" fill="#ffffff" stroke="#c99a20" strokeWidth="3.2" />
      <circle cx="60" cy="60" r="50" fill="#ffffff" stroke="#e4c46a" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="42.5" fill="#f8fbff" stroke="#0a2b59" strokeWidth="2.1" />

      <text fill="#0a1b35" fontFamily="Arial, sans-serif" fontSize="9.6" fontWeight="900" letterSpacing="2.1">
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
          BARANGAY
        </textPath>
      </text>
      <text fill="#0a1b35" fontFamily="Arial, sans-serif" fontSize="8.4" fontWeight="900" letterSpacing="1.8">
        <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">
          PILIPINAS
        </textPath>
      </text>

      <g fill="#c99a20">
        <path d="M20 55l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L20 55Z" />
        <path d="M100 55l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L100 55Z" />
      </g>

      <g opacity="0.9" stroke="#c99a20" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M31 78c-4 3-7 6-9 10" />
        <path d="M89 78c4 3 7 6 9 10" />
        <path d="M27 83l-7 1" />
        <path d="M93 83l7 1" />
      </g>

      <g clipPath={`url(#${id}-shield)`}>
        <rect x="38" y="36" width="22" height="31" fill="#f4c430" />
        <rect x="60" y="36" width="22" height="31" fill="#1261d7" />
        <rect x="38" y="67" width="22" height="32" fill="#1f8f4e" />
        <rect x="60" y="67" width="22" height="32" fill="#ef4444" />
        <path d="M60 36v63M38 67h44" stroke="#ffffff" strokeWidth="2.5" />

        <g fill="#0a1b35">
          <rect x="47" y="51" width="10" height="18" rx="1.5" />
          <path d="M45 51h14l-7-8-7 8Z" />
        </g>
        <g fill="#ffffff" opacity="0.92">
          <rect x="49" y="55" width="2.2" height="3.6" />
          <rect x="53" y="55" width="2.2" height="3.6" />
          <rect x="51" y="62" width="3" height="7" />
        </g>

        <g stroke="#0a1b35" strokeWidth="1.2">
          <path d="M67 62h11L72.5 46 67 62Z" fill="#fde68a" />
          <path d="M72.5 46v16" />
        </g>

        <path d="M41 88c8-10 16-11 25-1 5-7 10-8 16-4v16H41V88Z" fill="#14532d" opacity="0.88" />
        <circle cx="72" cy="78" r="5.2" fill="#fde047" stroke="#0a1b35" strokeWidth="1.2" />
      </g>

      <path d="M38 36h44v30c0 17.5-13.8 28.8-22 33-8.2-4.2-22-15.5-22-33V36Z" fill="none" stroke="#0a1b35" strokeWidth="2.4" />
      <path d="M48 36c2.4-8.4 7.5-12.5 12-12.5S69.6 27.6 72 36" fill="none" stroke="#c99a20" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
