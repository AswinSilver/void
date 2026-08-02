import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, Scan, Globe, Mail, QrCode, MessageSquare, Server } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

interface TopbarProps {
  onMenuClick: () => void
}

const quickScanOptions = [
  { label: 'URL', icon: Globe, href: '/scan/url' },
  { label: 'Email', icon: Mail, href: '/scan/email' },
  { label: 'QR Code', icon: QrCode, href: '/scan/qr' },
  { label: 'SMS', icon: MessageSquare, href: '/scan/sms' },
  { label: 'Domain', icon: Server, href: '/scan/domain' },
]

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showQuickScan, setShowQuickScan] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 border-b border-white/5 flex items-center gap-4 px-4 sticky top-0 z-30"
      style={{ background: 'rgba(10, 15, 30, 0.95)', backdropFilter: 'blur(12px)' }}>

      {/* Hamburger */}
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white p-1">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-lg relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scans, domains, IPs, hashes..."
          className="
            w-full pl-9 pr-4 py-2 text-sm rounded-lg
            bg-white/5 border border-white/8 text-slate-300
            placeholder:text-slate-600
            focus:outline-none focus:border-cyan-500/50 focus:bg-white/8
            transition-all duration-200
          "
        />
        {search && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 border border-white/10 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick Scan Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickScan(!showQuickScan)}
            className="
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
              bg-cyan-500/10 border border-cyan-500/25 text-cyan-400
              hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200
            "
          >
            <Scan size={14} />
            <span className="hidden sm:inline">Quick Scan</span>
            <ChevronDown size={13} className={`transition-transform ${showQuickScan ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showQuickScan && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 glass rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
              >
                {quickScanOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    to={opt.href}
                    onClick={() => setShowQuickScan(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <opt.icon size={14} className="text-cyan-400" />
                    {opt.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
          {user?.full_name?.[0] || user?.username?.[0] || 'U'}
        </button>
      </div>
    </header>
  )
}
