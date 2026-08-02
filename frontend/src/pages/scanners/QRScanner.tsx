import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Upload, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { scansApi } from '@/api/endpoints'

const MOCK_QR_RESULT = {
  risk_level: 'high',
  type: 'URL',
  extracted: 'https://qr-redirect.me/abc?next=https://fake-apple-id.pw/login',
  final_url: 'https://fake-apple-id.pw/login',
  redirect_count: 2,
  ai_verdict: 'This QR code encodes a URL that performs two redirects before landing on a credential harvesting page impersonating Apple ID login. The use of a QR code as an intermediary is a classic smishing vector to bypass link-click protections.',
  indicators: [
    'QR redirects twice before reaching destination',
    'Final URL leads to credential harvesting page',
    'Domain "fake-apple-id.pw" impersonating Apple',
    'Suspicious TLD: .pw (commonly used in phishing)',
  ],
}

export default function QRScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }, maxFiles: 1,
  })

  const handleScan = async () => {
    setScanning(true)
    try {
      // In a real app we'd decode the QR on the client or send the image to the backend.
      // Here we just pass an empty string and the mock backend uses its mock data.
      const { scan_id } = await scansApi.scanQr("")
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
      if (import.meta.env.DEV) setResult(MOCK_QR_RESULT)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <QrCode size={16} className="text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white">QR Code Scanner</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Upload a QR code image. We'll decode it, follow redirects, and provide AI threat analysis.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-blue-500/60 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/3'}`}>
          <input {...getInputProps()} />
          {preview ? (
            <div className="flex justify-center">
              <div className="relative">
                <img src={preview} alt="QR" className="w-48 h-48 object-contain rounded-xl" />
                <div className="absolute inset-0 border-2 border-blue-500/40 rounded-xl pointer-events-none" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode size={24} className="text-blue-400" />
              </div>
              <p className="text-white font-medium mb-1">Drop QR code image here</p>
              <p className="text-sm text-slate-500">PNG, JPG, WEBP supported</p>
            </>
          )}
        </div>
        {file && (
          <button onClick={handleScan} disabled={scanning} className="w-full mt-4 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
            {scanning ? 'Decoding & analyzing...' : 'Scan QR Code'}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">QR Analysis Result</h2>
              <RiskBadge level={result.risk_level} size="md" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'QR Type', value: result.type },
                { label: 'Extracted Content', value: result.extracted },
                { label: 'Final Destination', value: result.final_url },
                { label: 'Redirect Hops', value: `${result.redirect_count} redirects` },
              ].map((item) => (
                <div key={item.label} className="glass-lighter rounded-lg p-3 flex gap-4">
                  <span className="text-xs text-slate-500 w-36 flex-shrink-0 pt-0.5">{item.label}</span>
                  <span className="text-sm mono text-slate-200 break-all">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="glass-lighter rounded-xl p-4 border-l-2 border-blue-500/50">
              <p className="text-xs text-blue-400 font-semibold mb-2">AI Analysis</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.ai_verdict}</p>
            </div>
            <ul className="space-y-2">
              {result.indicators.map((ind: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-amber-400 mt-0.5">⚠</span> {ind}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
