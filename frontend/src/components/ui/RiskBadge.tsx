interface RiskBadgeProps {
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical' | string
  size?: 'sm' | 'md'
  showDot?: boolean
}

const levelConfig = {
  safe: { label: 'Safe', class: 'risk-safe' },
  low: { label: 'Low', class: 'risk-low' },
  medium: { label: 'Medium', class: 'risk-medium' },
  high: { label: 'High', class: 'risk-high' },
  critical: { label: 'Critical', class: 'risk-critical' },
}

export function RiskBadge({ level, size = 'sm', showDot = true }: RiskBadgeProps) {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.medium
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.class} ${sizeClass} uppercase tracking-wide`}>
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {config.label}
    </span>
  )
}

interface RiskScoreRingProps {
  score: number
  size?: number
}

export function RiskScoreRing({ score, size = 80 }: RiskScoreRingProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#f59e0b' : score >= 20 ? '#84cc16' : '#22c55e'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e2a40" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-white mono leading-none">{score}</span>
        <span className="text-[9px] text-slate-500 uppercase">Risk</span>
      </div>
    </div>
  )
}
