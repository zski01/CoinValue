import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

function Portfolio() {
  const { user } = useAuth()

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('coinvault_portfolio')
    return saved ? JSON.parse(saved) : []
  })

  const [liveData, setLiveData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Save portfolio to local fallback
  useEffect(() => {
    localStorage.setItem('coinvault_portfolio', JSON.stringify(portfolio))
  }, [portfolio])

  // Fetch live prices for portfolio coins
  useEffect(() => {
    if (portfolio.length === 0) return

    const fetchLiveData = async () => {
      setLoading(true)
      try {
        const ids = portfolio.map(item => item.id).join(',')
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
        )
        const dataMap = {}
        response.data.forEach(coin => {
          dataMap[coin.id] = {
            price: coin.current_price,
            change: coin.price_change_percentage_24h.toFixed(2),
            image: coin.image,
            symbol: coin.symbol.toUpperCase(),
          }
        })
        setLiveData(dataMap)
        setError(null)
      } catch (err) {
        setError('Failed to load live prices')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveData()
    const interval = setInterval(fetchLiveData, 60000)
    return () => clearInterval(interval)
  }, [portfolio])

  // Form for buy/sell
  const [showForm, setShowForm] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [coinName, setCoinName] = useState('')
  const [units, setUnits] = useState('')
  const [invested, setInvested] = useState('')

  const handleTransaction = (e) => {
    e.preventDefault()
    if (!coinName || !units || !invested) return alert('Fill all fields')

    const numUnits = parseFloat(units)
    const numInvested = parseFloat(invested)
    const multiplier = isBuy ? 1 : -1

    const id = coinName.toLowerCase().trim().replace(/\s+/g, '-')
    const existingIndex = portfolio.findIndex(item => item.id === id)

    let newPortfolio = [...portfolio]

    if (existingIndex >= 0) {
      const existing = newPortfolio[existingIndex]
      const newUnits = existing.units + (numUnits * multiplier)
      const newInvested = existing.invested + (numInvested * multiplier)

      if (newUnits <= 0) {
        newPortfolio = newPortfolio.filter((_, idx) => idx !== existingIndex)
      } else {
        const updated = { ...existing, units: newUnits, invested: newInvested }
        newPortfolio[existingIndex] = updated
      }
    } else if (isBuy) {
      const newItem = {
        id,
        name: coinName.trim(),
        units: numUnits,
        invested: numInvested,
      }
      newPortfolio.push(newItem)
    } else {
      alert('Cannot sell coin you do not own')
      return
    }

    setPortfolio(newPortfolio)
    setShowForm(false)
    setCoinName('')
    setUnits('')
    setInvested('')
  }

  const getTotalValue = () => {
    return portfolio
      .reduce((sum, item) => {
        const live = liveData[item.id]
        const value = item.units * (live?.price || 0)
        return sum + value
      }, 0)
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-emerald-600">My Portfolio</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-md"
          >
            + Add Transaction
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-md mb-10">
            <h2 className="text-3xl font-bold text-emerald-600 mb-6">New Transaction</h2>
            <form onSubmit={handleTransaction} className="space-y-6">
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setIsBuy(true)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${isBuy ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setIsBuy(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${!isBuy ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Coin ID (CoinGecko)</label>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="bitcoin, ethereum, solana..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Units {isBuy ? 'to Buy' : 'to Sell'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 0.5"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Amount {isBuy ? 'Invested ($)' : 'Received ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 25000"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition"
                >
                  {isBuy ? 'Buy' : 'Sell'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {portfolio.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md p-12">
            <p className="text-2xl text-gray-600 mb-4">Your portfolio is empty.</p>
            <p className="text-lg text-gray-500">Add your first investment above.</p>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Coin</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Units</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Invested</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Current Value</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => {
                    const live = liveData[item.id] || {}
                    const value = item.units * (live.price || 0)
                    return (
                      <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-8 py-6 font-medium text-gray-900 flex items-center">
                          {live.image && <img src={live.image} alt={item.name} className="w-8 h-8 mr-3 rounded-full" />}
                          {item.name}
                        </td>
                        <td className="px-8 py-6 text-gray-700">{item.units.toFixed(4)}</td>
                        <td className="px-8 py-6 text-gray-700">${item.invested.toLocaleString()}</td>
                        <td className="px-8 py-6 text-gray-700">${value.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={live.change >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {live.change ? `${live.change}%` : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-right text-3xl font-bold text-emerald-600">
              Total Portfolio Value: {getTotalValue()}
            </div>

            {loading && <p className="text-center mt-4 text-gray-600">Updating prices...</p>}
            {error && <p className="text-center mt-4 text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio