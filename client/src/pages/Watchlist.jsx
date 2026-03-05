// src/pages/Watchlist.jsx (full file)
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Navigate } from 'react-router-dom'

function Watchlist() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load saved IDs and fetch data
  useEffect(() => {
    const savedIds = localStorage.getItem('coinvault_watchlist_ids')
    if (savedIds) {
      const ids = JSON.parse(savedIds)
      if (ids.length > 0) {
        fetchCoins(ids)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCoins = async (coinIds) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
      )
      setWatchlist(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch coin data. Try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addCoin = () => {
    const coinId = prompt('Enter CoinGecko coin ID (e.g. bitcoin, ethereum, solana)')
    if (coinId && coinId.trim()) {
      const id = coinId.toLowerCase().trim()
      const savedIds = JSON.parse(localStorage.getItem('coinvault_watchlist_ids') || '[]')
      if (!savedIds.includes(id)) {
        const newIds = [...savedIds, id]
        localStorage.setItem('coinvault_watchlist_ids', JSON.stringify(newIds))
        fetchCoins(newIds)
      }
    }
  }

  const removeCoin = (id) => {
    if (window.confirm(`Remove ${id} from watchlist?`)) {
      const savedIds = JSON.parse(localStorage.getItem('coinvault_watchlist_ids') || '[]')
      const newIds = savedIds.filter(cid => cid !== id)
      localStorage.setItem('coinvault_watchlist_ids', JSON.stringify(newIds))
      setWatchlist(watchlist.filter(coin => coin.id !== id))
    }
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-vault-light p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-vault-primary">My Watchlist</h1>
          <button
            onClick={addCoin}
            className="bg-vault-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            + Add Coin
          </button>
        </div>

        {loading && <div className="text-center py-20 text-xl">Loading prices...</div>}

        {error && <p className="text-red-600 text-center text-xl mb-8">{error}</p>}

        {!loading && !error && watchlist.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-md p-12">
            <p className="text-2xl text-gray-600 mb-4">Your watchlist is empty.</p>
            <p className="text-lg text-gray-500">Add a coin to start tracking live prices.</p>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Coin</th>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Price (USD)</th>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">24h Change</th>
                  <th className="px-8 py-5 text-right text-lg font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((coin) => (
                  <tr key={coin.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-8 py-6 font-medium text-gray-900 flex items-center">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 mr-3 rounded-full" />
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </td>
                    <td className="px-8 py-6 text-gray-700">${coin.current_price.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={coin.price_change_percentage_24h >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => removeCoin(coin.id)}
                        className="text-red-600 hover:text-red-800 font-medium transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist