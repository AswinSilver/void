import api from './client'

export interface LoginRequest {
  username: string // email used as username
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  full_name?: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  username: string
  full_name?: string
  role: string
  avatar_url?: string
  organization_id?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: AuthUser
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const form = new FormData()
    form.append('username', data.username)
    form.append('password', data.password)
    const res = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },
  register: async (data: RegisterRequest) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  getMe: async (): Promise<AuthUser> => {
    const res = await api.get('/auth/me')
    return res.data
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return res.data
  },
}

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats')
    return res.data
  },
}

export const scansApi = {
  scanUrl: async (url: string, deepScan = false) => {
    const res = await api.post('/scans/url', { url, deep_scan: deepScan })
    return res.data
  },
  scanSms: async (message: string) => {
    const res = await api.post('/scans/sms', { message })
    return res.data
  },
  scanDomain: async (domain: string) => {
    const res = await api.post('/scans/domain', null, { params: { domain } })
    return res.data
  },
  scanEmail: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await api.post('/scans/email', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  scanQr: async (extractedText: string) => {
    const res = await api.post('/scans/qr', { extracted_text: extractedText })
    return res.data
  },
  getScan: async (scanId: string) => {
    const res = await api.get(`/scans/${scanId}`)
    return res.data
  },
  listScans: async (params?: {
    page?: number
    page_size?: number
    scan_type?: string
    risk_level?: string
    status?: string
  }) => {
    const res = await api.get('/scans/', { params })
    return res.data
  },
}

export const threatIntelApi = {
  lookup: async (ioc_type: string, value: string) => {
    const res = await api.get('/threat-intel/lookup', { params: { ioc_type, value } })
    return res.data
  },
}

export const aiApi = {
  chat: async (message: string, scan_id?: string, conversation_id?: string) => {
    const res = await api.post('/ai/chat', { message, scan_id, conversation_id })
    return res.data
  },
}
