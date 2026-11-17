/**
 * Animated SVG "broadcast" scene used as the hero background.
 * Pure SVG + CSS (no JS, no video file): signal rings, Union-Jack beams, floodlights,
 * drifting screens, twinkling stars and the red/white/blue swoosh from the logo.
 * Animations are disabled automatically for visitors who prefer reduced motion.
 */
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const STARS = Array.from({ length: 46 }, () => ({ x: Math.round(rnd() * 1600), y: Math.round(rnd() * 620), r: +(0.8 + rnd() * 1.8).toFixed(1), d: +(rnd() * 6).toFixed(1), t: +(3 + rnd() * 4).toFixed(1) }));

const SCREENS: { x: number; y: number; g: number; d: number; t: number; rot: number; hide?: boolean }[] = [
  { x: 70, y: 120, g: 0, d: 0, t: 9, rot: -6 },
  { x: 190, y: 470, g: 1, d: 1.5, t: 11, rot: 5 },
  { x: 30, y: 700, g: 2, d: 3, t: 10, rot: -4, hide: true },
  { x: 1290, y: 100, g: 3, d: 0.8, t: 10, rot: 6 },
  { x: 1340, y: 440, g: 4, d: 2.2, t: 12, rot: -5 },
  { x: 1180, y: 690, g: 0, d: 3.6, t: 9, rot: 4, hide: true }
];
const GRAD = [['#1E40AF', '#0B1B52'], ['#B91C1C', '#3B0A12'], ['#0B3FB3', '#071A5C'], ['#0F766E', '#04201E'], ['#7C2D6B', '#220B1E']];

export function HeroScene() {
  return (
    <svg className="hx-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hx-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040B22" /><stop offset=".55" stopColor="#0A1F6B" /><stop offset="1" stopColor="#050E2B" /></linearGradient>
        <radialGradient id="hx-glow" cx="50%" cy="46%" r="55%"><stop offset="0" stopColor="#0051E6" stopOpacity=".55" /><stop offset=".6" stopColor="#0A2F9E" stopOpacity=".15" /><stop offset="1" stopColor="#050E2B" stopOpacity="0" /></radialGradient>
        <radialGradient id="hx-vig" cx="50%" cy="50%" r="70%"><stop offset=".45" stopColor="#050E2B" stopOpacity="0" /><stop offset="1" stopColor="#050E2B" stopOpacity=".92" /></radialGradient>
        <linearGradient id="hx-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".72" stopColor="#050E2B" stopOpacity="0" /><stop offset="1" stopColor="#050E2B" stopOpacity="1" /></linearGradient>
        <linearGradient id="hx-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BCD0FF" stopOpacity=".5" /><stop offset="1" stopColor="#BCD0FF" stopOpacity="0" /></linearGradient>
        <linearGradient id="hx-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".09" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        {GRAD.map((g, i) => (
          <linearGradient key={i} id={`hx-g${i}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="1" stopColor={g[1]} /></linearGradient>
        ))}
      </defs>

      <rect width="1600" height="900" fill="url(#hx-bg)" />
      <rect width="1600" height="900" fill="url(#hx-glow)" />

      {/* Union-Jack inspired beams */}
      <g className="hx-sway" style={{ transformOrigin: '800px 450px' }}>
        <g transform="translate(800 450)" opacity=".5">
          <rect x="-1400" y="-14" width="2800" height="28" fill="#fff" opacity=".07" transform="rotate(33)" />
          <rect x="-1400" y="-6" width="2800" height="12" fill="#E3202B" opacity=".25" transform="rotate(33)" />
          <rect x="-1400" y="-14" width="2800" height="28" fill="#fff" opacity=".07" transform="rotate(-33)" />
          <rect x="-1400" y="-6" width="2800" height="12" fill="#E3202B" opacity=".25" transform="rotate(-33)" />
          <rect x="-1400" y="-30" width="2800" height="60" fill="#fff" opacity=".04" />
          <rect x="-1400" y="-10" width="2800" height="20" fill="#E3202B" opacity=".18" />
          <rect x="-30" y="-900" width="60" height="1800" fill="#fff" opacity=".04" />
          <rect x="-10" y="-900" width="20" height="1800" fill="#E3202B" opacity=".18" />
        </g>
      </g>

      {/* broadcast signal rings */}
      <g fill="none" stroke="#7FA6FF" strokeWidth="1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} className="hx-ring" cx="800" cy="450" r="260" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * 1.6}s` }} />
        ))}
      </g>

      {/* floodlight cones */}
      <polygon className="hx-cone" points="120,-20 300,-20 520,520 -80,520" fill="url(#hx-cone)" />
      <polygon className="hx-cone hx-cone2" points="1300,-20 1480,-20 1700,520 1100,520" fill="url(#hx-cone)" />

      {/* stars */}
      <g fill="#fff">
        {STARS.map((s, i) => (
          <circle key={i} className="hx-star" cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${s.d}s`, animationDuration: `${s.t}s` }} />
        ))}
      </g>

      {/* drifting screens */}
      {SCREENS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`} className={s.hide ? 'hx-hide-sm' : undefined}>
          <g className="hx-float" style={{ animationDelay: `${s.d}s`, animationDuration: `${s.t}s`, ['--r' as string]: `${s.rot}deg` }}>
            <rect width="250" height="140" rx="16" fill="#071238" stroke="#7FA6FF" strokeOpacity=".35" />
            <rect x="8" y="8" width="234" height="104" rx="10" fill={`url(#hx-g${s.g})`} />
            <circle cx="125" cy="60" r="20" fill="#fff" fillOpacity=".92" />
            <path d="M118 49 L136 60 L118 71 Z" fill="#0A1B4D" />
            <rect x="14" y="122" width="150" height="6" rx="3" fill="#fff" fillOpacity=".18" />
            <rect x="14" y="122" width="70" height="6" rx="3" fill="#E3202B" />
            <circle cx="224" cy="125" r="5" fill="#E3202B" className="hx-live" />
          </g>
        </g>
      ))}

      {/* light sweep */}
      <rect className="hx-sweep" x="-500" y="0" width="500" height="900" fill="url(#hx-sweep)" transform="skewX(-18)" />

      {/* swoosh ribbons (echo the logo) */}
      <g fill="none" strokeLinecap="round" className="hx-waves">
        <path className="hx-w1" d="M-100 790 C 260 700 640 860 1000 770 S 1560 700 1720 760" stroke="#0051E6" strokeWidth="5" strokeOpacity=".8" />
        <path className="hx-w2" d="M-100 812 C 260 722 640 882 1000 792 S 1560 722 1720 782" stroke="#fff" strokeWidth="3" strokeOpacity=".75" />
        <path className="hx-w3" d="M-100 832 C 260 742 640 902 1000 812 S 1560 742 1720 802" stroke="#E3202B" strokeWidth="5" strokeOpacity=".85" />
      </g>

      <rect width="1600" height="900" fill="url(#hx-vig)" />
      <rect width="1600" height="900" fill="url(#hx-fade)" />
    </svg>
  );
}
