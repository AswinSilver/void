import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { History as HistoryIcon, Filter, Search, Globe, Mail, QrCode, MessageSquare, Server, Bookmark, Flag, ChevronRight } from 'lucide-react'
import { scansApi } from '@/api/endpoints'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { Link } from 'react-router-dom'

const MOCK_HISTORY = [
  { id: '1', scan_type: 'url', target: 'https://suspicious-banking-portal.net/login', risk_level: 'critical', risk_score: 94, status: 'done', verdict: 'Phishing', is_bookmarked: true, created_at: '2024-08-01T12:22:00Z' },
  { id: '2', scan_type: 'email', target: 'phishing@fake-microsoft.com', risk_level: 'high', risk_score: 87, status: 'done', verdict: 'Phishing Email', is_bookmarked: false, created_at: '2024-08-01T11:15:00Z' },
  { id: '3', scan_type: 'qr', target: 'qr-image-20240801.png', risk_level: 'medium', risk_score: 55, status: 'done', verdict: 'Suspicious QR', is_bookmarked: false, created_at: '2024-08-01T10:30:00Z' },
  { id: '4', scan_type: 'domain', target: 'g00gle-secure-login.xyz', risk_level: 'critical', risk_score: 98, status: 'done', verdict: 'Typosquatting', is_bookmarked: true, created_at: '2024-08-01T09:45:00Z' },
  { id: '5', scan_type: 'sms', target: "Your FedEx package is on hold...", risk_level: 'high', risk_score: 82, status: 'done', verdict: 'Smishing', is_bookmarked: false, created_at: '2024-08-01T09:00:00Z' },
  { id: '6', scan_type: 'url', target: 'https://github.com/torvalds/linux', risk_level: 'safe', risk_score: 4, status: 'done', verdict: 'Clean', is_bookmarked: false, created_at: '2024-07-31T18:00:00Z' },
]

const scanTypeIcon: Record<string, any> = {
  url: Globe, email: Mail, qr: QrCode, sms: MessageSquare, domain: Server,
}

const scanTypeColor: Record<string, string> = {
  url: 'text-cyan-400 bg-cyan-500/10', email: 'text-purple-400 bg-purple-500/10',
  qr: 'text-blue-400 bg-blue-500/10', sms: 'text-amber-400 bg-amber-500/10',
  domain: 'text-green-400 bg-green-500/10',
}

export default function ScanHistory() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['scans', filterType, filterRisk],
    queryFn: () => scansApi.listScans({
      page: 1,
      page_size: 100,
      scan_type: filterType === 'all' ? undefined : filterType,
      risk_level: filterRisk === 'all' ? undefined : filterRisk,
    })
  })

  const scans = data?.scans || MOCK_HISTORY
  
  const filtered = scans.filter((s: any) => {
    if (search && !s.target.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
            <HistoryIcon size={16} className="text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Scan History</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Browse, filter, and revisit all previous scans.</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex-1 relative min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search targets..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-white/5 border border-white/8 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/8 text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Types</option>
          {Object.keys(scanTypeIcon).map(t => <option key={t} value={t} className="bg-slate-900 capitalize">{t.toUpperCase()}</option>)}
        </select>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/8 text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Risk Levels</option>
          {['safe', 'low', 'medium', 'high', 'critical'].map(r => <option key={r} value={r} className="bg-slate-900 capitalize">{r}</option>)}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <p className="text-xs text-slate-500">
            {isLoading ? 'Loading...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map((scan: any, i: number) => {
            const Icon = scanTypeIcon[scan.scan_type] || Globe
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${scanTypeColor[scan.scan_type] || scanTypeColor.url}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate mono">{scan.target}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{scan.verdict || 'No verdict'} • {new Date(scan.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {scan.is_bookmarked && <Bookmark size={13} className="text-cyan-400" fill="currentColor" />}
                  <span className="text-sm font-bold mono" style={{
                    color: scan.risk_score >= 80 ? '#ef4444' : scan.risk_score >= 60 ? '#f97316' : scan.risk_score >= 40 ? '#f59e0b' : scan.risk_score !== null ? '#22c55e' : '#64748b'
                  }}>{scan.risk_score !== null ? scan.risk_score : '-'}</span>
                  {scan.risk_level && <RiskBadge level={scan.risk_level} />}
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
