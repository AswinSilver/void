import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Upload, FileText, CheckCircle, AlertTriangle, X, Loader2, Info } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { RiskBadge, RiskScoreRing } from '@/components/ui/RiskBadge'
import { scansApi } from '@/api/endpoints'

const MOCK_EMAIL_RESULT = {
  risk_score: 87,
  risk_level: 'high',
  verdict: 'Phishing Email',
  headers: {
    from: 'Microsoft Security <security@micros0ft-alerts.net>',
    reply_to: 'no-reply@tracking-domain.ru',
    subject: 'Urgent: Your account will be suspended in 24 hours',
    date: 'Fri, 1 Aug 2024 09:22:11 +0000',
    message_id: '<abc123@micros0ft-alerts.net>',
    received_count: 4,
  },
  auth: {
    spf: { result: 'fail', domain: 'micros0ft-alerts.net' },
    dkim: { result: 'none', domain: 'N/A' },
    dmarc: { result: 'fail', policy: 'none' },
  },
  links: [
    { url: 'https://login.micros0ft.net/verify', risk: 'critical' },
    { url: 'https://click.tracking.ru/?id=abc123', risk: 'high' },
  ],
  attachments: [],
  indicators: [
    'SPF authentication failed — email not sent from claimed domain',
    'DKIM signature absent — cannot verify email integrity',
    'DMARC policy check failed',
    'Reply-To address uses .ru TLD — suspicious for Microsoft communications',
    'Sender domain "micros0ft-alerts.net" is typosquatting Microsoft',
    'Urgency language detected: "24 hours", "suspended"',
    'Embedded link leads to credential harvesting page',
  ],
}

export default function EmailScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('summary')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'message/rfc822': ['.eml'], 'application/vnd.ms-outlook': ['.msg'] },
    maxFiles: 1,
  })

  const handleScan = async () => {
    if (!file) return
    setScanning(true)
    try {
      const { scan_id } = await scansApi.scanEmail(file)
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
      if (import.meta.env.DEV) setResult(MOCK_EMAIL_RESULT)
    } finally {
      setScanning(false)
    }
  }

  const tabs = ['Summary', 'Headers', 'Authentication', 'Links & Attachments', 'AI Analysis']

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Mail size={16} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Email Scanner</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Analyze SPF/DKIM/DMARC, email headers, attachments, embedded links, and get AI-powered verdict.</p>
      </motion.div>

      {/* Upload */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'border-purple-500/60 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/40 hover:bg-white/3'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-purple-400" />
          </div>
          {file ? (
            <div>
              <p className="text-white font-medium flex items-center justify-center gap-2 mono">
                <FileText size={16} className="text-purple-400" /> {file.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <>
              <p className="text-white font-medium mb-1">Drop .eml or .msg file here</p>
              <p className="text-sm text-slate-500">or click to browse</p>
            </>
          )}
        </div>

        {file && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {scanning ? 'Analyzing email...' : 'Analyze Email'}
            </button>
            <button
              onClick={() => { setFile(null); setResult(null) }}
              className="px-4 py-2.5 glass border border-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass rounded-xl p-5 border border-orange-500/30">
              <div className="flex items-start gap-4">
                <RiskScoreRing score={result.risk_score} size={90} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-white">{result.verdict}</h2>
                    <RiskBadge level={result.risk_level} size="md" />
                  </div>
                  <p className="text-sm mono text-slate-400">{result.headers.from}</p>
                  <p className="text-sm text-slate-400 mt-1">&ldquo;{result.headers.subject}&rdquo;</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${result.auth.spf.result === 'pass' ? 'risk-safe' : 'risk-critical'}`}>
                      SPF: {result.auth.spf.result.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${result.auth.dkim.result === 'pass' ? 'risk-safe' : 'risk-critical'}`}>
                      DKIM: {result.auth.dkim.result.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${result.auth.dmarc.result === 'pass' ? 'risk-safe' : 'risk-critical'}`}>
                      DMARC: {result.auth.dmarc.result.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="flex border-b border-white/5 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase().replace(/[^a-z]/g, '-'))}
                    className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.toLowerCase().replace(/[^a-z]/g, '-')
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'summary' && (
                  <ul className="space-y-2">
                    {result.indicators.map((ind: any, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        {ind}
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'authentication' && (
                  <div className="space-y-3">
                    {[
                      { label: 'SPF', data: result.auth.spf },
                      { label: 'DKIM', data: result.auth.dkim },
                      { label: 'DMARC', data: result.auth.dmarc },
                    ].map(({ label, data }) => (
                      <div key={label} className="glass-lighter rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{label}</p>
                          <p className="text-xs text-slate-500 mono mt-0.5">{data.domain || (data as any).policy || ''}</p>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
                          data.result === 'pass' ? 'risk-safe' : data.result === 'none' ? 'risk-medium' : 'risk-critical'
                        } uppercase mono`}>
                          {data.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'links---attachments' && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Embedded Links ({result.links.length})</h4>
                    <div className="space-y-2">
                      {result.links.map((link: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 glass-lighter rounded-lg px-4 py-2.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${link.risk === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                          <p className="text-sm mono text-slate-300 flex-1 break-all">{link.url}</p>
                          <RiskBadge level={link.risk} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'headers' && (
                  <div className="glass-lighter rounded-lg p-4 mono text-xs space-y-2">
                    {Object.entries(result.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-purple-400 w-32 flex-shrink-0 capitalize">{k.replace(/_/g, '-')}</span>
                        <span className="text-slate-300 break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'ai-analysis' && (
                  <div className="glass-lighter rounded-xl p-4 border-l-2 border-purple-500/50">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      This email is a high-confidence phishing attempt impersonating Microsoft. The sender domain "micros0ft-alerts.net" is a deliberate typosquatting attempt, substituting the letter 'o' with '0'. 
                      The email fails all three email authentication mechanisms (SPF, DKIM, DMARC), meaning it was not authorized to be sent from Microsoft's email infrastructure. 
                      The reply-to address using a .ru TLD is inconsistent with legitimate Microsoft communications. The urgency language ("24 hours", "suspended") is designed to panic the recipient into clicking the embedded phishing link.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
