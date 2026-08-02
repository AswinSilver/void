import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { scansApi } from '@/api/endpoints'

const MOCK_DOMAIN_RESULT = {
  domain: '',
  risk_level: 'critical',
  risk_score: 97,
  verdict: 'High-Confidence Phishing Domain',
  whois: {
    registrar: 'NameCheap, Inc.',
    registered: '2024-07-29',
    expires: '2025-07-29',
    updated: '2024-07-29',
    age_days: 3,
    privacy: true,
    country: 'US',
  },
  dns: {
    a: ['104.21.89.43', '172.67.142.91'],
    mx: [],
    ns: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
    txt: [],
    spf: 'None',
    dmarc: 'None',
  },
  hosting: { isp: 'Cloudflare', country: 'United States', asn: 'AS13335', city: 'San Francisco' },
  risk_indicators: [
    { indicator: 'Recently registered (3 days)', severity: 'critical' },
    { indicator: 'Domain privacy enabled', severity: 'medium' },
    { indicator: 'No MX records — not used for email', severity: 'low' },
    { indicator: 'No SPF or DMARC policies', severity: 'high' },
    { indicator: 'Typosquatting a major bank', severity: 'critical' },
    { indicator: 'Registered with fast-flux hosting (Cloudflare proxy)', severity: 'medium' },
    { indicator: 'Suspicious TLD pattern for financial impersonation', severity: 'high' },
  ],
}

export default function DomainScanner() {
  const [domain, setDomain] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    setScanning(true)
    try {
      const { scan_id } = await scansApi.scanDomain(domain)
      let scanResult = null
      let pollCount = 0
      while (pollCount < 60) {
        await new Promise(r => setTimeout(r, 1000))
        scanResult = await scansApi.getScan(scan_id)
        if (scanResult.status === 'done') {
          setResult(scanResult)
          break
        }
        if (scanResult.status === 'error') throw new Error('Scan failed')
        pollCount++
      }
      if (!scanResult || scanResult.status !== 'done') throw new Error('Scan timed out')
    } catch (err) {
      console.error(err)
      if (import.meta.env.DEV) setResult({ ...MOCK_DOMAIN_RESULT, domain })
    } finally {
      setScanning(false)
    }
  }

  const severityColor: Record<string, string> = {
    critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-yellow-400',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Server size={16} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Domain Scanner</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Full domain intelligence: WHOIS, DNS, ASN, hosting, reputation, and AI risk assessment.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <form onSubmit={handleScan} className="flex gap-3">
          <div className="flex-1 relative">
            <Server size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example-suspicious-domain.xyz"
              disabled={scanning}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm mono bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-green-500/50 disabled:opacity-50 transition-all"
            />
          </div>
          <button type="submit" disabled={scanning || !domain.trim()} className="px-5 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap">
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Server size={14} />}
            {scanning ? 'Analyzing...' : 'Scan Domain'}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass rounded-xl p-5 border border-red-500/30 glow-red">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-white mono">{result.domain}</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{result.verdict}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-400 mono">{result.risk_score}</span>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WHOIS */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">WHOIS Information</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Registrar', value: result.whois.registrar },
                    { label: 'Registered', value: result.whois.registered, alert: result.whois.age_days < 30 },
                    { label: 'Expires', value: result.whois.expires },
                    { label: 'Age', value: `${result.whois.age_days} days`, alert: result.whois.age_days < 30 },
                    { label: 'Privacy', value: result.whois.privacy ? 'Enabled' : 'Disabled' },
                    { label: 'Country', value: result.whois.country },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className={`mono font-medium ${item.alert ? 'text-red-400' : 'text-slate-300'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hosting */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Hosting & Network</h3>
                <div className="space-y-2">
                  {[
                    { label: 'ISP', value: result.hosting.isp },
                    { label: 'Country', value: result.hosting.country },
                    { label: 'ASN', value: result.hosting.asn },
                    { label: 'City', value: result.hosting.city },
                    { label: 'A Records', value: result.dns.a.join(', ') },
                    { label: 'NS', value: result.dns.ns[0] },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm gap-4">
                      <span className="text-slate-500 flex-shrink-0">{item.label}</span>
                      <span className="mono font-medium text-slate-300 text-right truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Risk Indicators</h3>
              <div className="space-y-2">
                {result.risk_indicators.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between glass-lighter rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle size={13} className={severityColor[item.severity]} />
                      <span className="text-sm text-slate-300">{item.indicator}</span>
                    </div>
                    <span className={`text-xs font-semibold capitalize ${severityColor[item.severity]}`}>{item.severity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DNS */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">DNS Records</h3>
              <div className="glass-lighter rounded-lg p-4 mono text-xs space-y-2">
                {[
                  { type: 'A', values: result.dns.a },
                  { type: 'MX', values: result.dns.mx.length ? result.dns.mx : ['(none)'] },
                  { type: 'NS', values: result.dns.ns },
                  { type: 'TXT', values: result.dns.txt.length ? result.dns.txt : ['(none)'] },
                  { type: 'SPF', values: [result.dns.spf] },
                  { type: 'DMARC', values: [result.dns.dmarc] },
                ].map(({ type, values }) => (
                  <div key={type} className="flex gap-4">
                    <span className="text-green-400 w-16 flex-shrink-0">{type}</span>
                    <span className="text-slate-300">{values.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
