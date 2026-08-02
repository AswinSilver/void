import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Globe, Server, Hash, Mail, Loader2, ExternalLink } from 'lucide-react'
import { threatIntelApi } from '@/api/endpoints'

const IOC_TYPES = [
  { id: 'url', label: 'URL', icon: Globe, placeholder: 'https://suspicious-site.com' },
  { id: 'ip', label: 'IP Address', icon: Server, placeholder: '192.168.1.1' },
  { id: 'domain', label: 'Domain', icon: Server, placeholder: 'example-phishing.net' },
  { id: 'hash', label: 'File Hash', icon: Hash, placeholder: 'MD5/SHA256 hash' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'suspicious@example.com' },
]

const MOCK_TI_RESULT = {
  virustotal: { detections: 28, total: 72, categories: ['phishing', 'malware'], last_seen: '2024-08-01' },
  abuseipdb: { confidence: 87, reports: 23, country: 'RU', isp: 'Hosting Solutions Ltd' },
  urlhaus: { found: true, status: 'online', added: '2024-07-29', tags: ['phishing', 'credential-theft'] },
  alienvault_otx: { pulse_count: 3, malware_families: ['QakBot'], adversaries: ['TA505'] },
  openphish: { found: true, phish_detail_url: '#', target: 'Microsoft' },
}

export default function ThreatIntel() {
  const [iocType, setIocType] = useState('url')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const selected = IOC_TYPES.find(t => t.id === iocType)!

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    try {
      const data = await threatIntelApi.lookup(iocType, value)
      setResult(data.sources)
    } catch (err) {
      console.error(err)
      if (import.meta.env.DEV) setResult(MOCK_TI_RESULT)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield size={16} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Threat Intelligence</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Look up IOCs across VirusTotal, AbuseIPDB, URLhaus, AlienVault OTX, and OpenPhish.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6 space-y-4">
        {/* IOC type selector */}
        <div className="flex flex-wrap gap-2">
          {IOC_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => { setIocType(type.id); setResult(null) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                iocType === type.id
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                  : 'glass border border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <type.icon size={13} />
              {type.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleLookup} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={selected.placeholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm mono bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button type="submit" disabled={loading || !value.trim()} className="px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {loading ? 'Looking up...' : 'Lookup IOC'}
          </button>
        </form>
      </motion.div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* VirusTotal */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> VirusTotal
              </h3>
              <span className="text-2xl font-bold text-red-400 mono">{result.virustotal.detections}/{result.virustotal.total}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(result.virustotal.detections / result.virustotal.total) * 100}%` }} />
            </div>
            <div className="flex gap-2">
              {result.virustotal.categories.map((c: string) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 capitalize">{c}</span>
              ))}
            </div>
          </div>

          {/* Other sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full" /> AbuseIPDB
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Confidence</span><span className="mono text-orange-400 font-bold">{result.abuseipdb.confidence}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Reports</span><span className="mono text-slate-300">{result.abuseipdb.reports}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Country</span><span className="mono text-slate-300">{result.abuseipdb.country}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ISP</span><span className="mono text-slate-300 text-right text-xs">{result.abuseipdb.isp}</span></div>
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> URLhaus
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-red-400 font-medium capitalize">{result.urlhaus.status}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Added</span><span className="mono text-slate-300">{result.urlhaus.added}</span></div>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {result.urlhaus.tags.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{t}</span>)}
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" /> AlienVault OTX
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Pulses</span><span className="mono text-purple-400 font-bold">{result.alienvault_otx.pulse_count}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Malware</span><span className="mono text-slate-300">{result.alienvault_otx.malware_families.join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Adversaries</span><span className="mono text-slate-300">{result.alienvault_otx.adversaries.join(', ')}</span></div>
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full" /> OpenPhish
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Found</span><span className="text-red-400 font-medium">{result.openphish.found ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Target Brand</span><span className="mono text-slate-300">{result.openphish.target}</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
