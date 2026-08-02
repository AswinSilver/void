import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard, Globe, Mail, QrCode, MessageSquare, Server,
  Shield, History, FileText, Bot, Building2, Settings, LogOut,
  ChevronRight, Zap, X
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'URL Scanner', icon: Globe, href: '/scan/url' },
  { label: 'Email Scanner', icon: Mail, href: '/scan/email' },
  { label: 'QR Scanner', icon: QrCode, href: '/scan/qr' },
  { label: 'SMS Scanner', icon: MessageSquare, href: '/scan/sms' },
  { label: 'Domain Scanner', icon: Server, href: '/scan/domain' },
]

const secondaryItems = [
  { label: 'Threat Intel', icon: Shield, href: '/threat-intel' },
  { label: 'Scan History', icon: History, href: '/history' },
  { label: 'Reports', icon: FileText, href: '/reports' },
  { label: 'AI Chat', icon: Bot, href: '/ai-chat' },
  { label: 'Organizations', icon: Building2, href: '/organizations' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
    return (
      <Link
        to={item.href}
        onClick={() => window.innerWidth < 1024 && onClose()}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 group relative
          ${isActive
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 bg-cyan-500/8 rounded-lg border border-cyan-500/20"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
        <span className="relative z-10">{item.label}</span>
        {isActive && <ChevronRight size={12} className="ml-auto text-cyan-500 relative z-10" />}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -280 }}
        className={`
          fixed lg:relative top-0 left-0 z-50 lg:z-auto
          w-64 h-full flex flex-col
          bg-[#0a0f1e] border-r border-white/5
          lg:translate-x-0
        `}
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #050a14 100%)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight mono">VOID</span>
              <div className="text-[10px] text-cyan-500/70 font-medium tracking-wider">THREAT INTEL</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Scanners</p>
            {navItems.map((item) => <NavItem key={item.href} item={item} />)}
          </div>

          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Platform</p>
            {secondaryItems.map((item) => <NavItem key={item.href} item={item} />)}
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/5">
          <div className="glass-lighter rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.full_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1 flex-shrink-0"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
