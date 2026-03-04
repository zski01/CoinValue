import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Watchlist() {
  const { user } = useAuth()

  // Load watchlist from localStorage or use default fake data
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('coinvault_watchlist')
    return saved ? JSON.parse(saved) : [
      { id: 'bitcoin', name: 'Bitcoin (BTC)', price: '$68,420', change: '+3.2%' },
      { id: 'ethereum', name: 'Ethereum (ETH)', price: '$3,450', change: '-0.8%' },
      { id: 'solana', name: 'Solana (SOL)', price: '$195', change: '+7.1%' },
    ]
  })

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    localStorage.setItem('coinvault_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addCoin = () => {
    const coinName = prompt('Enter coin name (e.g. Cardano ADA)')
    if (coinName && coinName.trim()) {
      const newCoin = {
        id: coinName.toLowerCase().trim().replace(/\s+/g, '-'),
        name: coinName.trim(),
        price: 'N/A (demo)',
        change: '0.0%',
      }
      setWatchlist([...watchlist, newCoin])
    }
  }

  const removeCoin = (id) => {
    if (window.confirm(`Remove ${id.toUpperCase()} from watchlist?`)) {
      setWatchlist(watchlist.filter(coin => coin.id !== id))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vault-light">
        <p className="text-2xl text-gray-700">Please log in to view your watchlist</p>
      </div>
    )
  }

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

        {watchlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md p-12">
            <p className="text-2xl text-gray-600 mb-4">Your watchlist is empty.</p>
            <p className="text-lg text-gray-500">Click "Add Coin" to start tracking your favorite investments.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Coin</th>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Current Price</th>
                  <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">24h Change</th>
                  <th className="px-8 py-5 text-right text-lg font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((coin) => (
                  <tr key={coin.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-8 py-6 font-medium text-gray-900">{coin.name}</td>
                    <td className="px-8 py-6 text-gray-700">{coin.price}</td>
                    <td className="px-8 py-6">
                      <span className={coin.change.startsWith('+') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {coin.change}
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