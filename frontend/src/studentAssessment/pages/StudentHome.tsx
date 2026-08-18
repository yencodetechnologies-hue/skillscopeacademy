import React from 'react'
import { useStudentAuthStore } from '../store/useStudentAuthStore'
import { api } from '../lib/api'
import { LogOut, User, Hash, FileText } from 'lucide-react'

const StudentHome: React.FC = () => {
  const { student } = useStudentAuthStore()

  const handleLogout = () => {
    api.studentLogout()
    localStorage.removeItem('student_info')
    window.location.href = '/studentassement/student-login'
  }

  if (!student) return null

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1e3a8a] text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Welcome, {student.name}</h1>
            <p className="text-gray-500 mt-1">Student assessment portal</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Hash className="text-[#1e3a8a]" size={20} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student ID</p>
                <p className="font-bold text-gray-800">{student.student_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FileText className="text-[#1e3a8a]" size={20} />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="font-bold text-gray-800">{student.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              Open the assessment link shared by your assessor. Your name and student ID are already saved for this session.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentHome
