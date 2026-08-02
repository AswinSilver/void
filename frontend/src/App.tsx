import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

// Pages
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import URLScanner from '@/pages/scanners/URLScanner'
import EmailScanner from '@/pages/scanners/EmailScanner'
import QRScanner from '@/pages/scanners/QRScanner'
import SMSScanner from '@/pages/scanners/SMSScanner'
import DomainScanner from '@/pages/scanners/DomainScanner'
import ThreatIntel from '@/pages/ThreatIntel'
import AIChat from '@/pages/AIChat'
import History from '@/pages/History'
import Reports from '@/pages/Reports'
import Organizations from '@/pages/Organizations'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes inside app layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scan/url" element={<URLScanner />} />
                <Route path="/scan/email" element={<EmailScanner />} />
                <Route path="/scan/qr" element={<QRScanner />} />
                <Route path="/scan/sms" element={<SMSScanner />} />
                <Route path="/scan/domain" element={<DomainScanner />} />
                <Route path="/threat-intel" element={<ThreatIntel />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/history" element={<History />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
