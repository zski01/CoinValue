import { Routes, Route, Link } from 'react-router-dom'
import './index.css'

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-vault-primary mb-4">CoinVault</h1>
      <p className="text-xl text-gray-600 mb-8">Track your investments — crypto, stocks, and more</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-vault-accent text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
          Login
        </Link>
        <Link to="/signup" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
          Sign Up
        </Link>
      </div>
    </div>
  )
}

function Login() {
  return <div className="min-h-screen flex items-center justify-center">Login Page (coming soon)</div>
}

function Signup() {
  return <div className="min-h-screen flex items-center justify-center">Sign Up Page (coming soon)</div>
}

function Dashboard() {
  return <div className="min-h-screen flex items-center justify-center">Dashboard (protected – coming soon)</div>
}

function App() {
  return (
    <div>
      {/* Simple top nav for now */}
      <nav className="bg-vault-dark text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-vault-primary">CoinVault</Link>
          <div className="space-x-6">
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App