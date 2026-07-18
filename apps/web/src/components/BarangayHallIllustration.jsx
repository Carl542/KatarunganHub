export default function BarangayHallIllustration() {
  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      role="img"
      aria-label="Illustration of a barangay hall at dusk with the Philippine flag"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08132c" />
          <stop offset="55%" stopColor="#0e2352" />
          <stop offset="100%" stopColor="#274b86" />
        </linearGradient>
        <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1730" stopOpacity="0" />
          <stop offset="100%" stopColor="#07102a" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf3d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fdf3d6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="facade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1c3d6b" />
          <stop offset="55%" stopColor="#12315a" />
          <stop offset="100%" stopColor="#0b2445" />
        </linearGradient>
        <linearGradient id="pediment" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#173962" />
          <stop offset="100%" stopColor="#0c2748" />
        </linearGradient>
        <linearGradient id="column" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2c5188" />
          <stop offset="35%" stopColor="#1a3f6e" />
          <stop offset="100%" stopColor="#0f2c50" />
        </linearGradient>
        <radialGradient id="canopy" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#204a52" />
          <stop offset="100%" stopColor="#0c2430" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1c3f" />
          <stop offset="100%" stopColor="#050c1e" />
        </linearGradient>
      </defs>

      <rect width="600" height="900" fill="url(#sky)" />

      {/* moon */}
      <circle cx="480" cy="130" r="60" fill="url(#moonGlow)" />
      <circle cx="480" cy="130" r="26" fill="#fbf6e3" opacity="0.92" />
      <circle cx="470" cy="122" r="24" fill="#08132c" opacity="0.35" />

      {/* stars */}
      <g fill="#f1e4cc" opacity="0.55">
        <circle cx="80" cy="90" r="1.6" />
        <circle cx="150" cy="160" r="1.2" />
        <circle cx="120" cy="230" r="1" />
        <circle cx="60" cy="300" r="1.3" />
        <circle cx="220" cy="110" r="1.4" />
        <circle cx="300" cy="60" r="1.4" />
        <circle cx="360" cy="180" r="1" />
      </g>

      {/* distant tree line */}
      <path d="M0 700 Q60 660 120 690 T240 685 T360 692 T480 680 T600 690 L600 740 L0 740 Z" fill="#0a1c38" opacity="0.7" />

      {/* ground */}
      <rect y="730" width="600" height="170" fill="url(#ground)" />
      <rect y="726" width="600" height="10" fill="#132646" />

      {/* trees */}
      <g>
        <rect x="83" y="670" width="14" height="60" fill="#1a2e1f" />
        <circle cx="90" cy="600" r="42" fill="url(#canopy)" />
        <circle cx="65" cy="625" r="30" fill="url(#canopy)" opacity="0.9" />
        <circle cx="118" cy="628" r="32" fill="url(#canopy)" opacity="0.9" />
        <circle cx="90" cy="580" r="26" fill="#2c5c48" opacity="0.5" />

        <rect x="503" y="670" width="14" height="60" fill="#1a2e1f" />
        <circle cx="510" cy="600" r="42" fill="url(#canopy)" />
        <circle cx="485" cy="625" r="30" fill="url(#canopy)" opacity="0.9" />
        <circle cx="538" cy="628" r="32" fill="url(#canopy)" opacity="0.9" />
        <circle cx="510" cy="580" r="26" fill="#2c5c48" opacity="0.5" />
      </g>

      {/* steps */}
      <rect x="145" y="722" width="310" height="16" rx="2" fill="#7a5f22" />
      <rect x="160" y="706" width="280" height="16" rx="2" fill="#a3822f" />
      <rect x="176" y="690" width="248" height="16" rx="2" fill="#c9a227" />
      <rect x="176" y="690" width="248" height="4" fill="#e8dba0" opacity="0.6" />

      {/* building shadow */}
      <ellipse cx="300" cy="700" rx="180" ry="14" fill="#020712" opacity="0.5" />

      {/* building base */}
      <rect x="168" y="432" width="264" height="258" fill="url(#facade)" />
      <rect x="168" y="432" width="264" height="258" fill="none" stroke="#c9a227" strokeOpacity="0.35" strokeWidth="1.5" />
      <line x1="168" y1="560" x2="432" y2="560" stroke="#c9a227" strokeOpacity="0.2" strokeWidth="1" />

      {/* pediment / roof */}
      <path d="M148 432 L300 328 L452 432 Z" fill="url(#pediment)" stroke="#c9a227" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M183 422 L300 344 L417 422 Z" fill="url(#facade)" />
      <circle cx="300" cy="388" r="12" fill="#f1e4cc" opacity="0.9" />
      <path d="M292 388 a8 8 0 0 1 16 0" fill="none" stroke="#0c2748" strokeWidth="1.5" opacity="0.5" />
      <line x1="148" y1="432" x2="452" y2="432" stroke="#0c2748" strokeWidth="2" opacity="0.6" />

      {/* cornice */}
      <rect x="152" y="426" width="296" height="12" fill="#c9a227" opacity="0.75" />
      <rect x="152" y="436" width="296" height="4" fill="#8a6a1e" opacity="0.6" />

      {/* columns with highlight + shadow edges */}
      {[192, 238, 284, 330, 376].map((x, i) => (
        <g key={i}>
          <rect x={x} y="440" width="18" height="250" fill="url(#column)" />
          <rect x={x + 2} y="440" width="3" height="250" fill="#5b83b8" opacity="0.45" />
          <rect x={x + 13} y="440" width="4" height="250" fill="#040c1c" opacity="0.35" />
          <rect x={x - 2} y="436" width="22" height="8" fill="#8a6a1e" opacity="0.8" />
          <rect x={x - 2} y="688" width="22" height="8" fill="#8a6a1e" opacity="0.8" />
        </g>
      ))}

      {/* entrance doorway */}
      <rect x="270" y="558" width="60" height="132" fill="#f1e4cc" opacity="0.5" />
      <rect x="270" y="558" width="60" height="132" fill="none" stroke="#0c2748" strokeWidth="2.5" />
      <line x1="300" y1="558" x2="300" y2="690" stroke="#0c2748" strokeWidth="1.5" opacity="0.6" />
      <path d="M270 558 q30 -18 60 0" fill="none" stroke="#c9a227" strokeWidth="2" opacity="0.7" />

      {/* windows, lit, with frames */}
      {[
        [196, 468], [196, 538], [196, 608],
        [374, 468], [374, 538], [374, 608],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 2} width="30" height="44" fill="#08132c" opacity="0.5" />
          <rect x={x} y={y} width="26" height="40" fill="#f1c96b" opacity="0.92" />
          <line x1={x + 13} y1={y} x2={x + 13} y2={y + 40} stroke="#7a5a17" strokeWidth="1.5" opacity="0.6" />
          <line x1={x} y1={y + 20} x2={x + 26} y2={y + 20} stroke="#7a5a17" strokeWidth="1.5" opacity="0.6" />
        </g>
      ))}

      {/* flagpole */}
      <line x1="300" y1="328" x2="300" y2="252" stroke="#e8dba0" strokeWidth="2.5" />
      <circle cx="300" cy="250" r="2.5" fill="#f1e4cc" />

      {/* Philippine flag, peacetime orientation (blue over red, white hoist triangle) */}
      <g transform="translate(300,258)">
        <rect x="0" y="0" width="72" height="18" fill="#0038a8" />
        <rect x="0" y="18" width="72" height="18" fill="#ce1126" />
        <path d="M0,0 L0,36 L26,18 Z" fill="#ffffff" />
        <circle cx="12" cy="18" r="4.4" fill="#fcd116" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x2 = 12 + Math.cos(angle) * 7.2;
          const y2 = 18 + Math.sin(angle) * 7.2;
          return <line key={i} x1={12 + Math.cos(angle) * 4.6} y1={18 + Math.sin(angle) * 4.6} x2={x2} y2={y2} stroke="#fcd116" strokeWidth="1" />;
        })}
        <circle cx="20" cy="4.5" r="1.8" fill="#fcd116" />
        <circle cx="20" cy="31.5" r="1.8" fill="#fcd116" />
        <circle cx="4.5" cy="18" r="1.8" fill="#fcd116" />
      </g>

      {/* signage band */}
      <rect x="222" y="498" width="156" height="20" rx="2" fill="#08132c" opacity="0.45" />
      <rect x="222" y="498" width="156" height="20" rx="2" fill="none" stroke="#c9a227" strokeOpacity="0.3" />

      <rect width="600" height="900" fill="url(#vignette)" />
    </svg>
  );
}
