export default function BarangayHallIllustration() {
  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      role="img"
      aria-label="Illustration of a barangay hall at dusk"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1730" />
          <stop offset="55%" stopColor="#0e2352" />
          <stop offset="100%" stopColor="#1a3a72" />
        </linearGradient>
        <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1730" stopOpacity="0" />
          <stop offset="100%" stopColor="#08122a" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect width="600" height="900" fill="url(#sky)" />

      {/* stars */}
      <g fill="#f1e4cc" opacity="0.5">
        <circle cx="80" cy="90" r="1.6" />
        <circle cx="160" cy="150" r="1.2" />
        <circle cx="480" cy="80" r="1.6" />
        <circle cx="520" cy="160" r="1.2" />
        <circle cx="300" cy="60" r="1.4" />
        <circle cx="220" cy="120" r="1" />
        <circle cx="420" cy="130" r="1" />
      </g>

      {/* ground */}
      <rect y="740" width="600" height="160" fill="#08122a" />
      <rect y="730" width="600" height="14" fill="#0c1c3f" />

      {/* trees */}
      <g fill="#0e2b3f" opacity="0.9">
        <ellipse cx="90" cy="640" rx="46" ry="70" />
        <rect x="82" y="690" width="16" height="50" />
        <ellipse cx="510" cy="640" rx="46" ry="70" />
        <rect x="502" y="690" width="16" height="50" />
      </g>

      {/* steps */}
      <rect x="150" y="720" width="300" height="14" fill="#c9a227" opacity="0.85" />
      <rect x="165" y="706" width="270" height="14" fill="#d9c26a" opacity="0.8" />
      <rect x="180" y="692" width="240" height="14" fill="#e8dba0" opacity="0.75" />

      {/* building base */}
      <rect x="170" y="430" width="260" height="262" fill="#0f2748" />
      <rect x="170" y="430" width="260" height="262" fill="none" stroke="#c9a227" strokeOpacity="0.3" strokeWidth="1" />

      {/* pediment */}
      <path d="M150 430 L300 330 L450 430 Z" fill="#0c2039" stroke="#c9a227" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M185 420 L300 350 L415 420 Z" fill="#0f2748" />
      <circle cx="300" cy="392" r="11" fill="#f1e4cc" opacity="0.85" />

      {/* cornice */}
      <rect x="155" y="424" width="290" height="12" fill="#c9a227" opacity="0.7" />

      {/* columns */}
      {[195, 240, 285, 330, 375].map((x, i) => (
        <rect key={i} x={x} y="440" width="16" height="248" fill="#183460" stroke="#f1e4cc" strokeOpacity="0.12" />
      ))}

      {/* entrance doorway */}
      <rect x="272" y="560" width="56" height="128" fill="#f1e4cc" opacity="0.55" />
      <rect x="272" y="560" width="56" height="128" fill="none" stroke="#0f2748" strokeWidth="2" />

      {/* windows, lit */}
      {[
        [200, 470], [200, 540], [200, 610],
        [372, 470], [372, 540], [372, 610],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="26" height="40" rx="1" fill="#f1c96b" opacity="0.9" />
      ))}

      {/* flagpole */}
      <line x1="300" y1="330" x2="300" y2="270" stroke="#e8dba0" strokeWidth="2.5" />
      <path d="M300 270 L340 282 L300 294 Z" fill="#9c1c1c" opacity="0.9" />

      {/* signage band */}
      <rect x="230" y="500" width="140" height="18" fill="#08122a" opacity="0.4" />

      <rect width="600" height="900" fill="url(#vignette)" />
    </svg>
  );
}
