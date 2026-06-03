import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'

import { useRegister } from '../../hooks/useAuth'
import "../../styles/auth.css"

const schema = yup.object({
  name: yup.string().required('Name is required'),

  email: yup
    .string()
    .email('Invalid Email')
    .required('Email is required'),

  password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),

  role: yup
    .string()
    .required('Please select a role'),
})

function RegisterForm() {
  const { mutate, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'user',
    },
  })

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    }

    mutate(payload)
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2>Create Account</h2>

      <div className="form-group">
        <input
          type="text"
          placeholder="Full Name"
          {...register('name')}
        />
        <span>{errors.name?.message}</span>
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="Email Address"
          {...register('email')}
        />
        <span>{errors.email?.message}</span>
      </div>

      <div className="form-group">
        <select {...register('role')}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <span>{errors.role?.message}</span>
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
        />
        <span>{errors.password?.message}</span>
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword')}
        />
        <span>{errors.confirmPassword?.message}</span>
      </div>

      <button
        className="auth-btn"
        disabled={isPending}
      >
        {isPending ? 'Creating Account...' : 'Register'}
      </button>
      <p className="auth-link">
  Already have an account?
  <Link to="/login"> Sign In</Link>
</p>
    </form>
  )
}

export default RegisterForm