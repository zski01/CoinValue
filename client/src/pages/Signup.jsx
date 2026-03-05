import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    console.log('1. Form submit triggered – button clicked')

    if (!username.trim() || !password.trim()) {
      setError('Fill username and password')
      setLoading(false)
      console.log('Validation failed')
      return
    }

    const payload = {
      username: username.trim(),
      password: password.trim()
    }

    console.log('2. Data to send:', payload)

    try {
      console.log('3. Sending POST to http://localhost:3000/register')
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('4. Response from backend:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`)
      }

      setSuccess('Success! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      console.log('5. Full error:', err)
      setError(err.message || 'Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-green-600 mb-8 text-center">Create Account</h2>

        {error && <p className="text-red-600 mb-6 text-center font-medium">{error}</p>}
        {success && <p className="text-green-600 mb-6 text-center font-medium">{success}</p>}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border rounded-lg"
              placeholder="username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-lg"
              placeholder="password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-lg text-white font-semibold ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup