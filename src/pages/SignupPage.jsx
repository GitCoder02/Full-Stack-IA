import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Client-side validation first
    if (!form.name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    // CRITICAL: signup() is async — must await it
    const result = await signup(form.name.trim(), form.email, form.password)

    if (!result.success) {
      setError(result.message || 'Signup failed. Please try again.')
      setLoading(false)
      return
    }

    navigate('/profile')
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-4"
      style={{ background: '#f0f4f8' }}
    >
      <div className="w-100" style={{ maxWidth: 480 }}>
        <div className="card border-0 shadow-lg rounded-4 p-4">

          <div className="text-center mb-4">
            <h2 className="fw-bold">Create Account 🚀</h2>
            <p className="text-muted">Join the MIT Internship Portal today</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-3">
              <span>⚠️</span>
              <span className="small">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                className={`form-control form-control-lg rounded-3 ${error && !form.name.trim() ? 'is-invalid' : ''}`}
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-lg rounded-3"
                placeholder="you@mit.edu"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                name="password"
                className={`form-control form-control-lg rounded-3 ${error && form.password.length < 6 ? 'is-invalid' : ''}`}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Confirm Password</label>
              <input
                type="password"
                name="confirm"
                className={`form-control form-control-lg rounded-3 ${error && form.password !== form.confirm ? 'is-invalid' : ''}`}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage