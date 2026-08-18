import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/useAuthStore'
import { useStudentAuthStore } from './store/useStudentAuthStore'
import Login from './pages/Login'
import StudentLogin from './pages/StudentLogin'
import StudentHome from './pages/StudentHome'
import Dashboard from './pages/Dashboard'
import AssessmentForm from './pages/AssessmentForm'
import CommonAssessment from './pages/CommonAssessment'
import GradingPortal from './pages/GradingPortal'
import { Loader2 } from 'lucide-react'
import { API_URL as BASE_API_URL } from '../data/service'
import { api } from './lib/api'

import './tailwind-entry.css'
import './assessment-custom.css'

const queryClient = new QueryClient()
const API_URL = `${BASE_API_URL}/api/student-assessment`
const BASE = '/studentassement'

function StudentAssessmentApp() {
  const { setUser, setLoading, loading, user } = useAuthStore()
  const {
    setStudent,
    setLoading: setStudentLoading,
    loading: studentLoading,
    student,
  } = useStudentAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const studentToken = localStorage.getItem('student_auth_token')

    const assessorPromise = token
      ? fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              localStorage.removeItem('auth_token')
              setUser(null)
            } else {
              setUser(data)
            }
          })
          .catch(() => setUser(null))
      : Promise.resolve(setUser(null))

    const studentPromise = studentToken
      ? api
          .studentMe()
          .then((data) => {
            if (data.error) {
              localStorage.removeItem('student_auth_token')
              setStudent(null)
            } else {
              setStudent(data)
              localStorage.setItem(
                'student_info',
                JSON.stringify({ name: data.name, id: data.student_id })
              )
            }
          })
          .catch(() => setStudent(null))
      : Promise.resolve(setStudent(null))

    Promise.all([assessorPromise, studentPromise]).finally(() => {
      setLoading(false)
      setStudentLoading(false)
    })
  }, [setUser, setLoading, setStudent, setStudentLoading])

  if (loading || studentLoading) {
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
          <Route index element={<Navigate to={`${BASE}/login`} replace />} />

          {/* Public Assessment Routes */}
          <Route path="assessment" element={<AssessmentForm />} />
          <Route path="common-assessment" element={<CommonAssessment />} />

          {/* Assessor Auth */}
          <Route
            path="login"
            element={!user ? <Login /> : <Navigate to={`${BASE}/dashboard`} replace />}
          />

          {/* Student Auth */}
          <Route
            path="student-login"
            element={!student ? <StudentLogin /> : <Navigate to={`${BASE}/student-home`} replace />}
          />
          <Route
            path="student-home"
            element={student ? <StudentHome /> : <Navigate to={`${BASE}/student-login`} replace />}
          />

          {/* Protected Assessor Routes */}
          <Route
            path="dashboard"
            element={user ? <Dashboard /> : <Navigate to={`${BASE}/login`} replace />}
          />
          <Route
            path="grade/:id"
            element={user ? <GradingPortal /> : <Navigate to={`${BASE}/login`} replace />}
          />

          {/* Unknown paths — always reset to login (prevents /login/dashboard/... loops) */}
          <Route path="*" element={<Navigate to={`${BASE}/login`} replace />} />
        </Routes>
      </QueryClientProvider>
    </div>
  )
}

export default StudentAssessmentApp
