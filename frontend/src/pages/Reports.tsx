import { motion } from 'framer-motion'
import { FileText, Download } from 'lucide-react'

export default function Reports() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText size={16} className="text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Generated Reports</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">View and download automated threat analysis reports.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-12 text-center">
        <FileText size={48} className="mx-auto text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">No reports generated yet</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          When a high-risk threat is detected during a scan, VOID AI will automatically generate a comprehensive incident report here.
        </p>
      </motion.div>
    </div>
  )
}
