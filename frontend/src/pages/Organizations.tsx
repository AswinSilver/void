import { motion } from 'framer-motion'
import { Building2, Users } from 'lucide-react'

export default function Organizations() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Building2 size={16} className="text-pink-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Organizations</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Manage your team and enterprise workspaces.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-12 text-center">
        <Users size={48} className="mx-auto text-slate-600 mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Enterprise Feature</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Organization management is available on Enterprise plans. Upgrade to manage team members, role-based access control, and shared scan history.
        </p>
        <button className="px-4 py-2 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 rounded-lg text-sm font-medium transition-colors border border-pink-500/20">
          Contact Sales
        </button>
      </motion.div>
    </div>
  )
}
