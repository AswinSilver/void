import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Bell, Shield, Key } from 'lucide-react'

export default function Settings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
            <SettingsIcon size={16} className="text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-400 text-sm ml-11">Manage your account preferences and API keys.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User size={16}/> Profile Settings</h2>
        <p className="text-slate-400 mb-4">Profile configuration is coming soon.</p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Key size={16}/> API Keys</h2>
        <p className="text-slate-400 mb-4">Generate API keys to integrate VOID into your CI/CD pipelines.</p>
        <button className="px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg text-sm font-medium transition-colors border border-cyan-500/20">
          Generate New Key
        </button>
      </motion.div>
    </div>
  )
}
import { User } from 'lucide-react';
