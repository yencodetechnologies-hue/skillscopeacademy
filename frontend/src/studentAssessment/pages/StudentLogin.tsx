import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react'

const StudentLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const data = await api.studentLogin(email, password)

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (data.user) {
      localStorage.setItem(
        'student_info',
        JSON.stringify({ name: data.user.name, id: data.user.student_id })
      )
    }

    window.location.href = '/studentassement/student-home'
  }

  return (
    <div className="min-h-screen bg-[#eff6ff] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden mb-8">
        <div className="bg-[#1e3a8a] p-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/assets/Skilscope.png"
              alt="Skilscope Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white border-none normal-case">Student Portal</h2>
          <p className="text-blue-100 mt-1">Sign in to access your assessments</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition-all"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login as Student'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Assessor?{' '}
            <Link to="/studentassement/login" className="text-[#1e3a8a] font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default StudentLogin
