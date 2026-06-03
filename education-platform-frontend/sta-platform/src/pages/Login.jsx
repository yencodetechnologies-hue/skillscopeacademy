import LoginForm from '../components/auth/LoginForm'
import './authpage.css'

const Login = () => {
  return (
    <section className='auth-wrapper'>

      <div className='auth-left'>

        <div className='auth-overlay'>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to continue your professional safety training journey.
          </p>

        </div>

      </div>

      <div className='auth-right'>
        <LoginForm />
      </div>

    </section>
  )
}

export default Login