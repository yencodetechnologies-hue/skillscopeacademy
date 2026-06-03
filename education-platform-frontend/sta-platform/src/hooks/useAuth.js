import { useMutation } from '@tanstack/react-query'
import { loginUser, registerUser } from '../services/authService'
import toast from 'react-hot-toast'

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,

    onSuccess: () => {
      toast.success('Registration Successful')
    },

    onError: (error) => {
      toast.error(error.response?.data?.message)
    },
  })
}

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: () => {
      toast.success('Login Successful')
    },

    onError: (error) => {
      toast.error(error.response?.data?.message)
    },
  })
}