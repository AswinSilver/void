import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  glowColor?: string
  trend?: { value: number; label: string }
  delay?: number
}

export function StatCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-cyan-400',
  glowColor = 'glow-cyan', trend, delay = 0
}: StatCardProps) {
  const isPositiveTrend = trend && trend.value >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-xl p-5 ${glowColor} hover:border-cyan-500/25 transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/8 transition-colors`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white mono">{value}</span>
        {subtitle && <span className="text-sm text-slate-500 mb-1">{subtitle}</span>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositiveTrend
            ? <TrendingUp size={12} className="text-green-400" />
            : <TrendingDown size={12} className="text-red-400" />
          }
          <span className={`text-xs font-medium ${isPositiveTrend ? 'text-green-400' : 'text-red-400'}`}>
            {isPositiveTrend ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-600">{trend.label}</span>
        </div>
      )}
    </motion.div>
  )
}
