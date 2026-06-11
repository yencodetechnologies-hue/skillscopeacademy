import { Navigate } from 'react-router-dom'

/**
 * GuestRoute — only accessible when NOT logged in.
 * If the user is already authenticated, redirect them to the home page.
 * They can still visit the home page and navigate to their dashboard from there.
 */
const GuestRoute = ({ children }) => {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) }
    catch { return null }
  })()

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default GuestRoute