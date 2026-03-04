import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import './index.css'

// Home page (public)
function Home() {
  return (
    <div className="min-h-screen bg-vault-light flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl font-bold text-vault-primary mb-4">CoinVault</h1>
      <p className="text-2xl text-gray-700 mb-10 text-center max-w-2xl">
        Securely track your investments in crypto, stocks, ETFs and more.
      </p>
      <div className="flex space-x-6">
        <Link to="/login" className="bg-vault-accent text-white px-10 py-5 rounded-xl text-xl hover:bg-indigo-700">
          Login
        </Link>
        <Link to="/signup" className="bg-gray-700 text-white px-10 py-5 rounded-xl text-xl hover:bg-gray-800">
          Sign Up
        </Link>
      </div>
    </div>
  )
}

// Login page
function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // Fake successful login (later connect to your backend)
    const fakeUser = { username, token: 'fake-jwt-token' }
    login(fakeUser)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-light p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-vault-primary mb-8 text-center">Login to CoinVault</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent"
              placeholder="yourusername"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-vault-accent text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// Protected Dashboard (redirect if not logged in)
function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-vault-light p-8">
      <h1 className="text-5xl font-bold text-vault-primary mb-8">Welcome, {user.username}!</h1>
      <p className="text-xl text-gray-700">Your investment dashboard is ready.</p>
      <p className="mt-4 text-gray-600">Portfolio, watchlist, charts, and more coming soon...</p>
    </div>
  )
}

// Placeholder Signup
function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-light p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-vault-primary mb-8 text-center">Create Account</h2>
        <p className="text-center text-gray-600">Sign up form coming soon...</p>
      </div>
    </div>
  )
}

function App() {
  const { user, logout } = useAuth()

  return (
    <>
      <nav className="bg-vault-dark text-white p-5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-vault-primary">
            CoinVault
          </Link>
          <div className="space-x-8 text-lg">
            <Link to="/" className="hover:text-vault-accent transition">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-vault-accent transition">Dashboard</Link>
                <button
                  onClick={logout}
                  className="hover:text-red-400 transition bg-transparent border-none cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-vault-accent transition">Login</Link>
                <Link to="/signup" className="hover:text-vault-accent transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App