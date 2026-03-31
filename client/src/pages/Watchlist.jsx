import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

function Watchlist() {
  const { user } = useAuth()

  const [ids, setIds] = useState([])           // coin IDs
  const [liveData, setLiveData] = useState({}) // live prices/details
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load IDs from backend or local fallback
  useEffect(() => {
    const loadIds = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const res = await axios.get('http://localhost:3000/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('coinvault_token') || ''}`
          }
        })
        const loadedIds = res.data.watchlist || []
        setIds(loadedIds)

        if (loadedIds.length > 0) {
          await fetchLivePrices(loadedIds)
        }
      } catch (err) {
        console.warn('Backend load failed – using local fallback', err)
        const saved = localStorage.getItem('coinvault_watchlist_ids')
        const loadedIds = saved ? JSON.parse(saved) : []
        setIds(loadedIds)
        if (loadedIds.length > 0) {
          await fetchLivePrices(loadedIds)
        }
      } finally {
        setLoading(false)
      }
    }

    loadIds()
  }, [user])

  // Fetch live prices from CoinGecko
  const fetchLivePrices = async (coinIds) => {
    if (coinIds.length === 0) return

    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
      )
      const dataMap = {}
      response.data.forEach(coin => {
        dataMap[coin.id] = {
          price: coin.current_price,
          change: coin.price_change_percentage_24h?.toFixed(2) ?? 'N/A',
          image: coin.image,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
        }
      })
      setLiveData(dataMap)
      setError(null)
    } catch (err) {
      setError('Failed to load live prices (CoinGecko may be rate-limited)')
      console.error('CoinGecko error:', err)
    }
  }

  // Add coin
  const addCoin = () => {
    const coinId = prompt('Enter CoinGecko coin ID (examples: bitcoin, ethereum, solana, cardano, ripple, dogecoin)')
    if (!coinId || !coinId.trim()) return

    const id = coinId.toLowerCase().trim()
    if (ids.includes(id)) {
      alert('Already in watchlist')
      return
    }

    const newIds = [...ids, id]
    setIds(newIds)

    // Save to backend
    if (user) {
      axios.post('http://localhost:3000/user-data', { watchlist: newIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('coinvault_token') || ''}` }
      }).catch(err => console.warn('Backend save failed', err))
    }

    // Local fallback
    localStorage.setItem('coinvault_watchlist_ids', JSON.stringify(newIds))

    // Fetch price for new coin
    fetchLivePrices([id])
  }

  // Remove coin
  const removeCoin = (id) => {
    if (!window.confirm(`Remove ${id.toUpperCase()}?`)) return

    const newIds = ids.filter(cid => cid !== id)
    setIds(newIds)
    setLiveData(prev => {
      const newData = { ...prev }
      delete newData[id]
      return newData
    })

    // Save to backend
    if (user) {
      axios.post('http://localhost:3000/user-data', { watchlist: newIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('coinvault_token') || ''}` }
      }).catch(err => console.warn('Backend save failed', err))
    }

    // Local fallback
    localStorage.setItem('coinvault_watchlist_ids', JSON.stringify(newIds))
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-600">My Watchlist</h1>
          <button
            onClick={addCoin}
            className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg w-full md:w-auto"
          >
            + Add Coin
          </button>
        </div>

        {loading && <div className="text-center py-12 text-xl text-gray-600">Loading live prices...</div>}

        {error && <p className="text-red-600 text-center text-lg mb-8 bg-red-50 p-4 rounded-lg">{error}</p>}

        {ids.length === 0 && !loading && !error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md p-12">
            <p className="text-2xl text-gray-600 mb-4">No coins selected yet</p>
            <p className="text-lg text-gray-500">Add coins (bitcoin, ethereum, solana, cardano, ripple, dogecoin) to track live prices.</p>
          </div>
        )}

        {ids.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-5 text-left text-lg font-semibold text-gray-700">Coin</th>
                    <th className="px-6 py-5 text-left text-lg font-semibold text-gray-700">Price (USD)</th>
                    <th className="px-6 py-5 text-left text-lg font-semibold text-gray-700">24h Change</th>
                    <th className="px-6 py-5 text-right text-lg font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ids.map((id) => {
                    const coin = liveData[id] || { name: id.charAt(0).toUpperCase() + id.slice(1), price: 'Loading...', change: 'N/A', symbol: id.toUpperCase() }
                    return (
                      <tr key={id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-6 py-5 font-medium text-gray-900 flex items-center gap-3">
                          {coin.image && <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />}
                          {coin.name} ({coin.symbol})
                        </td>
                        <td className="px-6 py-5 text-gray-700 font-medium">
                          {coin.price === 'Loading...' ? coin.price : `$${coin.price?.toLocaleString() || 'N/A'}`}
                        </td>
                        <td className="px-6 py-5">
                          <span className={Number(coin.change) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {coin.change}%
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => removeCoin(id)}
                            className="text-red-600 hover:text-red-800 font-medium transition"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist