import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Shield, Globe, Mail, QrCode, MessageSquare, Server, ArrowRight, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'URL Scanner',
    description: 'Deep URL analysis with redirect chains, SSL, WHOIS, DNS, and AI-powered verdict',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Mail,
    title: 'Email Scanner',
    description: 'Full SPF/DKIM/DMARC analysis, header inspection, attachment scanning, link extraction',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: QrCode,
    title: 'QR Scanner',
    description: 'Decode QR codes and analyze embedded URLs, Wi-Fi credentials, and payment links',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: MessageSquare,
    title: 'SMS Scanner',
    description: 'Detect urgency scams, fake deliveries, OTP theft, and banking fraud in SMS messages',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Server,
    title: 'Domain Scanner',
    description: 'Full domain intelligence: registrar, DNS, ASN, hosting, risk indicators, and more',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: Shield,
    title: 'Threat Intelligence',
    description: 'Aggregate IOC data from VirusTotal, AbuseIPDB, URLhaus, AlienVault OTX & more',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
]

const stats = [
  { value: '10M+', label: 'URLs Scanned' },
  { value: '99.7%', label: 'Detection Rate' },
  { value: '< 5s', label: 'Avg Scan Time' },
  { value: '25+', label: 'Threat Intel Sources' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [urlInput, setUrlInput] = useState('')

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput) navigate(`/scan/url?url=${encodeURIComponent(urlInput)}`)
  }

  return (
    <div className="min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight mono">VOID</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">Log in</Link>
          <Link
            to="/register"
            className="text-sm font-semibold text-white bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 px-4 py-1.5 rounded-lg transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/20 text-sm text-cyan-300 mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full status-pulse" />
            AI-Powered Phishing Investigation Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Investigate threats.<br />
            <span className="gradient-text">Not just detect them.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            VOID gives SOC analysts and organizations a complete forensic view of phishing attacks —
            with AI reasoning, threat intelligence, visual evidence, and remediation advice.
          </p>

          {/* Quick scan */}
          <form onSubmit={handleQuickScan} className="flex gap-2 max-w-xl mx-auto mb-6">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste a suspicious URL, domain, or email address..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 glow-cyan flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Zap size={15} />
              Scan Now
            </button>
          </form>

          <p className="text-xs text-slate-600">No signup required for quick scans • Full features with free account</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4">
              <p className="text-2xl font-bold text-white mono">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need to<br /><span className="gradient-text">fight phishing</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">A complete platform built for the modern SOC team — from quick lookups to deep forensic investigations.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass rounded-xl p-5 border ${feature.border} hover:scale-[1.02] transition-all duration-300 group cursor-pointer`}
            >
              <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon size={20} className={feature.color} />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              <div className={`flex items-center gap-1 mt-4 text-xs ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <span>Explore</span> <ArrowRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl border border-cyan-500/20 p-12 max-w-2xl mx-auto glow-cyan"
        >
          <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start investigating today</h2>
          <p className="text-slate-400 mb-8">Join hundreds of SOC teams using VOID to investigate phishing faster with AI-powered analysis.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              Create free account <ChevronRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 glass border border-white/10 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center text-xs text-slate-600">
        <p>VOID — AI-Powered Phishing Investigation Platform • Built for SOC Analysts</p>
      </footer>
    </div>
  )
}
