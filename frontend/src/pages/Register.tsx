import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strength = passwordStrength()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'text-red-400', 'text-amber-400', 'text-yellow-400', 'text-green-400'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({ email: form.email, username: form.username, full_name: form.full_name, password: form.password })
      navigate('/login?registered=1')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-2xl tracking-tight mono">VOID</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-2">Start investigating threats today — it's free</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Full name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="janesmith"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="analyst@company.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength
                        ? strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : strength === 3 ? 'bg-yellow-400' : 'bg-green-500'
                        : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strengthColor}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Confirm password</label>
              <div className="relative">
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                {form.confirm && form.password === form.confirm && (
                  <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-all glow-cyan flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
