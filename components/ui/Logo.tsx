import Link from 'next/link'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rc-blue" x1="120" y1="50" x2="185" y2="145" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Blue gradient fill — inner concave of C + R leg zone, drawn under black strokes */}
      <polygon
        points="135,105 185,68 185,102 160,155 115,155 115,135"
        fill="url(#rc-blue)"
      />

      {/* R: left vertical */}
      <rect x="15" y="15" width="20" height="140" fill="#0d0d0d" />
      {/* Shared top bar */}
      <rect x="15" y="15" width="170" height="20" fill="#0d0d0d" />
      {/* R: right side of bump */}
      <rect x="115" y="15" width="20" height="90" fill="#0d0d0d" />
      {/* R: middle arm */}
      <rect x="15" y="85" width="120" height="20" fill="#0d0d0d" />
      {/* R: diagonal leg */}
      <polygon points="95,105 135,105 160,155 120,155" fill="#0d0d0d" />

      {/* C: top-right segment */}
      <rect x="165" y="15" width="20" height="53" fill="#0d0d0d" />
      {/* C: bottom arm */}
      <rect x="115" y="135" width="70" height="20" fill="#0d0d0d" />
      {/* C: bottom-right segment */}
      <rect x="165" y="102" width="20" height="53" fill="#0d0d0d" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LogoMark className="h-8 w-auto" />
      <span className="font-black text-[1.15rem] tracking-[-0.03em] uppercase leading-none select-none">
        raw&amp;cut
      </span>
    </Link>
  )
}
