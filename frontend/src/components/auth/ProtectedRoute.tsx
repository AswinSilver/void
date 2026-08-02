import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm mono">Initializing VOID...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
