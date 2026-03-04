// src/App.jsx (full file)
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Watchlist from './pages/Watchlist'
import Portfolio from './pages/Portfolio'
import './index.css'
import { useState } from 'react'

// Home
function Home() {
  return (
    <div className="min-h-screen bg-vault-light flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl font-bold text-vault-primary mb-4">CoinVault</h1>
      <p className="text-2xl text-gray-700 mb-10 text-center max-w-2xl">
        Securely track your investments in crypto, stocks, ETFs and more — all in one place.
      </p>
      <div className="flex space-x-6">
        <Link
          to="/login"
          className="bg-vault-accent text-white px-10 py-5 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition shadow-md"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="bg-gray-700 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:bg-gray-800 transition shadow-md"
        >
          Sign Up
        </Link>
      </div>
    </div>
  )
}

// Login
function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill both fields')
      return
    }

    const fakeUser = { username, token: 'fake-jwt-' + Date.now() }
    login(fakeUser)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-light p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-vault-primary mb-8 text-center">Login to CoinVault</h2>

        {error && <p className="text-red-600 mb-6 text-center font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent transition"
              placeholder="yourusername"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-vault-accent text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

// Dashboard (protected)
function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl text-gray-700">Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-vault-light p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-vault-primary mb-8">Welcome back, {user.username}!</h1>
        <p className="text-xl text-gray-700">Your investment dashboard is ready. Features coming soon...</p>
      </div>
    </div>
  )
}

// Signup placeholder
function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-vault-light p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-vault-primary mb-8 text-center">Create Account</h2>
        <p className="text-center text-gray-600 text-xl">Sign up form coming soon...</p>
      </div>
    </div>
  )
}

// App
function App() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()  // ← this line must be here

  return (
    <>
      <nav className="bg-vault-dark text-white p-5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-vault-primary">
            CoinVault
          </Link>

          <div className="space-x-8 text-lg flex items-center">
            <Link to="/" className="hover:text-vault-accent transition">Home</Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-vault-accent transition">Dashboard</Link>
                <Link to="/watchlist" className="hover:text-vault-accent transition">Watchlist</Link>
                <Link to="/portfolio" className="hover:text-vault-accent transition">Portfolio</Link>
                <button
                  onClick={logout}
                  className="hover:text-red-400 transition bg-transparent border-none cursor-pointer font-medium"
                >
                  Logout
                </button>
                {/* Dark mode toggle – only visible when logged in */}
                <button
                  onClick={toggleDarkMode}
                  className="ml-4 text-2xl hover:text-vault-accent transition"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
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
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </>
  )
}

export default App

