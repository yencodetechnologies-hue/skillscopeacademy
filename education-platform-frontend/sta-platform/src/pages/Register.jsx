import RegisterForm from '../components/auth/RegisterForm'
import './authpage.css'

const Register = () => {
  return (
    <section className='auth-wrapper'>

      <div className='auth-left'>

        <div className='auth-overlay'>

          <h1>
            Create Account
          </h1>

          <p>
            Start learning with Australia's trusted training academy.
          </p>

        </div>

      </div>

      <div className='auth-right'>
        <RegisterForm />
      </div>

    </section>
  )
}

export default Register