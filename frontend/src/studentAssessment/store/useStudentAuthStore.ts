import { create } from 'zustand'

export interface StudentUser {
  id: string
  email: string
  name: string
  student_id: string
  role: 'student'
}

interface StudentAuthState {
  student: StudentUser | null
  setStudent: (student: StudentUser | null) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export const useStudentAuthStore = create<StudentAuthState>((set) => ({
  student: null,
  setStudent: (student) => set({ student }),
  loading: true,
  setLoading: (loading) => set({ loading }),
}))
