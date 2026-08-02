import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Loader2, AlertTriangle } from 'lucide-react'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { scansApi } from '@/api/endpoints'

const MOCK_SMS_RESULT = {
  risk_level: 'high',
  verdict: 'Phishing SMS — Fake Delivery Scam',
  categories: ['Fake Delivery', 'Credential Harvesting', 'Urgency Manipulation'],
  indicators: [
    'Impersonating a major courier service (FedEx/DHL)',
    'Urgency language: "Your package is on hold"',
    'Shortened/suspicious URL to evade detection',
    'Requests personal information via web form',
    'Sender is a mobile number, not a verified shortcode',
  ],
  ai_verdict: 'This SMS is a classic "smishing" (SMS phishing) attack mimicking a package delivery notification. The message creates urgency by claiming a package is held, then directs the victim to a fraudulent website to "confirm" their address or pay a small fee — capturing credit card or personal data in the process.',
  url_found: 'https://dl.vry-post.com/track?id=38291',
  url_risk: 'critical',
}

export default function SMSScanner() {
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setScanning(true)
    try {
      const { scan_id } = await scansApi.scanSms(message)
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
      if (import.meta.env.DEV) setResult(MOCK_SMS_RESULT)
    } finally {
      setScanning(false)
    }
  }

  const exampleMessages = [
    "Your FedEx package is on hold. Confirm address: https://dl.vry-post.com/tr...",
    "URGENT: Your bank account has been locked. Verify now: bit.ly/3xYz2A",
    "You've won a $500 gift card! Claim now: click.prize-win.com/abc",
    "OTP for your account: 847291. Never share this code with anyone.",
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <MessageSquare size={16} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white">SMS Scanner</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Paste a suspicious SMS message. AI will detect phishing, scams, urgency tactics, and impersonation.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">SMS Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the suspicious SMS message here..."
              rows={5}
              disabled={scanning}
              className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={scanning || !message.trim()}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
            {scanning ? 'Analyzing message...' : 'Analyze SMS'}
          </button>
        </form>

        <div className="mt-5">
          <p className="text-xs text-slate-600 mb-2 font-medium uppercase tracking-wider">Try an example</p>
          <div className="space-y-2">
            {exampleMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => { setMessage(msg); setResult(null) }}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-200 mono px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 transition-all truncate"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 space-y-5 border border-orange-500/20">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{result.verdict}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.categories.map((cat: string) => (
                    <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{cat}</span>
                  ))}
                </div>
              </div>
              <RiskBadge level={result.risk_level} size="md" />
            </div>

            {result.url_found && (
              <div className="flex items-center gap-3 glass-lighter rounded-lg p-3">
                <span className="text-xs text-slate-500 flex-shrink-0">URL Detected</span>
                <span className="text-sm mono text-slate-300 break-all flex-1">{result.url_found}</span>
                <RiskBadge level={result.url_risk} />
              </div>
            )}

            <div className="glass-lighter rounded-xl p-4 border-l-2 border-amber-500/50">
              <p className="text-xs text-amber-400 font-semibold mb-2">AI Analysis</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.ai_verdict}</p>
            </div>

            <ul className="space-y-2">
              {result.indicators.map((ind: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" /> {ind}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
