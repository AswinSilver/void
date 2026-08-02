import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Scan, ShieldAlert, Mail, AlertTriangle, CheckCircle, Users, Key, TrendingUp,
  Globe, ArrowRight, Clock, Shield
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { dashboardApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'

const RISK_COLORS = {
  safe: '#22c55e',
  low: '#84cc16',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

// Mock timeline data
const scanTimeline = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  scans: Math.floor(Math.random() * 80 + 20),
  phishing: Math.floor(Math.random() * 20),
}))

export default function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    retry: false,
  })

  // Fallback mock data when API is unavailable
  const mockStats = {
    today_scans: 47,
    high_risk_today: 12,
    total_scans: 1842,
    detected_phishing: 389,
    false_positives: 23,
    risk_distribution: { safe: 45, low: 20, medium: 18, high: 12, critical: 5 },
    scan_type_distribution: { url: 52, email: 28, qr: 8, sms: 7, domain: 5 },
    recent_scans: [
      { id: '1', scan_type: 'url', target: 'https://suspicious-banking-portal.net/login', risk_level: 'critical', risk_score: 94, status: 'done', created_at: new Date().toISOString() },
      { id: '2', scan_type: 'email', target: 'phishing@fake-microsoft.com', risk_level: 'high', risk_score: 87, status: 'done', created_at: new Date().toISOString() },
      { id: '3', scan_type: 'qr', target: 'qr-image-20240801.png', risk_level: 'medium', risk_score: 55, status: 'done', created_at: new Date().toISOString() },
      { id: '4', scan_type: 'domain', target: 'g00gle-secure-login.xyz', risk_level: 'critical', risk_score: 98, status: 'done', created_at: new Date().toISOString() },
      { id: '5', scan_type: 'sms', target: "Your package is held. Click: dl.vry-post.com/tr...", risk_level: 'high', risk_score: 82, status: 'done', created_at: new Date().toISOString() },
    ],
  }

  const d = stats || mockStats
  const riskPieData = Object.entries(d.risk_distribution || {}).map(([name, value]) => ({ name, value }))
  const scanTypePieData = Object.entries(d.scan_type_distribution || {}).map(([name, value]) => ({ name, value }))

  const scanTypeColors = ['#06b6d4', '#818cf8', '#f59e0b', '#22c55e', '#f97316']

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.full_name || user?.username}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's what's happening with your threat landscape today.</p>
        </div>
        <Link
          to="/scan/url"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition-all duration-200 glow-cyan"
        >
          <Scan size={15} />
          New Scan
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Scans"
          value={d.today_scans}
          icon={Scan}
          iconColor="text-cyan-400"
          trend={{ value: 12, label: 'vs yesterday' }}
          delay={0}
        />
        <StatCard
          title="High Risk Today"
          value={d.high_risk_today}
          icon={ShieldAlert}
          iconColor="text-red-400"
          glowColor="glow-red"
          trend={{ value: -5, label: 'vs yesterday' }}
          delay={0.05}
        />
        <StatCard
          title="Detected Phishing"
          value={d.detected_phishing}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          glowColor="glow-amber"
          subtitle="total"
          delay={0.1}
        />
        <StatCard
          title="False Positives"
          value={d.false_positives}
          icon={CheckCircle}
          iconColor="text-green-400"
          glowColor="glow-green"
          subtitle="total"
          delay={0.15}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scan Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Scan Activity</h3>
              <p className="text-xs text-slate-500">Last 14 days</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scanTimeline} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="phishGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="scans" stroke="#06b6d4" strokeWidth={2} fill="url(#scanGradient)" name="Total Scans" />
              <Area type="monotone" dataKey="phishing" stroke="#ef4444" strokeWidth={2} fill="url(#phishGradient)" name="Phishing" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-1">Risk Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">All-time scan results</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {riskPieData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {riskPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[entry.name as keyof typeof RISK_COLORS] }} />
                <span className="text-xs text-slate-400 capitalize">{entry.name}</span>
                <span className="text-xs text-slate-600 ml-auto">{String(entry.value)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Recent Scans</h3>
          </div>
          <Link to="/history" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {d.recent_scans.map((scan: any, i: number) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                scan.scan_type === 'url' ? 'bg-cyan-500/10' :
                scan.scan_type === 'email' ? 'bg-purple-500/10' :
                scan.scan_type === 'domain' ? 'bg-blue-500/10' :
                'bg-amber-500/10'
              }`}>
                {scan.scan_type === 'url' ? <Globe size={14} className="text-cyan-400" /> :
                 scan.scan_type === 'email' ? <Mail size={14} className="text-purple-400" /> :
                 <Shield size={14} className="text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate mono">{scan.target}</p>
                <p className="text-xs text-slate-600 mt-0.5 capitalize">{scan.scan_type} • {new Date(scan.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {scan.risk_score && (
                  <span className="text-sm font-bold mono" style={{
                    color: scan.risk_score >= 80 ? '#ef4444' : scan.risk_score >= 60 ? '#f97316' : scan.risk_score >= 40 ? '#f59e0b' : '#22c55e'
                  }}>
                    {scan.risk_score}
                  </span>
                )}
                {scan.risk_level && <RiskBadge level={scan.risk_level} />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
