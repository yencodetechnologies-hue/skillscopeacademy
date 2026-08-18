import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/useAuthStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AssessmentForm from './pages/AssessmentForm'
import CommonAssessment from './pages/CommonAssessment'
import GradingPortal from './pages/GradingPortal'
import { Loader2 } from 'lucide-react'
import { API_URL as BASE_API_URL } from '../data/service'

import './tailwind-entry.css'
import './assessment-custom.css'

const queryClient = new QueryClient()
const API_URL = `${BASE_API_URL}/api/student-assessment`

// Mounted at /studentassement/* in the main app's router, so every path
// below is relative to that prefix (no leading slash).
function StudentAssessmentApp() {
  const { setUser, setLoading, loading, user } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            localStorage.removeItem('auth_token')
            setUser(null)
          } else {
            setUser(data)
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    } else {
      setUser(null)
      setLoading(false)
    }
  }, [setUser, setLoading])

  if (loading) {
    return (
      <div className="sa-root min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
      </div>
    )
  }

  return (
    <div className="sa-root">
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public Assessment Routes */}
          <Route path="assessment" element={<AssessmentForm />} />
          <Route path="common-assessment" element={<CommonAssessment />} />

          {/* Auth Routes */}
          <Route
            path="login"
            element={!user ? <Login /> : <Navigate to="dashboard" replace />}
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="dashboard"
            element={user ? <Dashboard /> : <Navigate to="login" replace />}
          />

          <Route
            path="grade/:id"
            element={user ? <GradingPortal /> : <Navigate to="login" replace />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </QueryClientProvider>
    </div>
  )
}

export default StudentAssessmentApp
