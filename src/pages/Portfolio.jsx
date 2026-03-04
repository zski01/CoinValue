import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function Portfolio() {
  const { user } = useAuth()

  // Load from localStorage or fake data
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('coinvault_portfolio')
    return saved ? JSON.parse(saved) : [
      { id: 'bitcoin', name: 'Bitcoin (BTC)', units: 0.5, invested: 25000, currentValue: 34210, change: '+36.8%' },
      { id: 'ethereum', name: 'Ethereum (ETH)', units: 10, invested: 30000, currentValue: 34500, change: '+15.0%' },
    ]
  })

  // Save on change
  useEffect(() => {
    localStorage.setItem('coinvault_portfolio', JSON.stringify(portfolio))
  }, [portfolio])

  const [showForm, setShowForm] = useState(false)
  const [isBuy, setIsBuy] = useState(true)
  const [coinName, setCoinName] = useState('')
  const [units, setUnits] = useState('')
  const [invested, setInvested] = useState('')

  const handleTransaction = (e) => {
    e.preventDefault()
    if (!coinName || !units || !invested) return

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
        const updated = {
          ...existing,
          units: newUnits,
          invested: newInvested,
          currentValue: newInvested * 1.1, // fake 10% gain
        }
        newPortfolio[existingIndex] = updated
      }
    } else if (isBuy) {
      const newItem = {
        id,
        name: coinName.trim(),
        units: numUnits,
        invested: numInvested,
        currentValue: numInvested * 1.1,
        change: '+10.0%'
      }
      newPortfolio.push(newItem)
    }

    setPortfolio(newPortfolio)

    // Reset form
    setCoinName('')
    setUnits('')
    setInvested('')
    setShowForm(false)
  }

  const getTotalValue = () => {
    const total = portfolio.reduce((sum, item) => sum + item.currentValue, 0)
    return total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-vault-light p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-bold text-vault-primary">My Portfolio</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-vault-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            + Add Transaction
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-xl shadow-md mb-10">
            <h2 className="text-3xl font-bold text-vault-primary mb-6">New Transaction</h2>
            <form onSubmit={handleTransaction} className="space-y-6">
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setIsBuy(true)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    isBuy ? 'bg-vault-primary text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setIsBuy(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${
                    !isBuy ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Coin Name</label>
                <input
                  type="text"
                  value={coinName}
                  onChange={(e) => setCoinName(e.target.value)}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent"
                  placeholder="e.g. Bitcoin BTC"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Units {isBuy ? 'to Buy' : 'to Sell'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent"
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
                  className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-accent"
                  placeholder="e.g. 25000"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-vault-accent text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
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
            <p className="text-lg text-gray-500">
              Click "Add Transaction" to start building your investments.
            </p>
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
                    <th className="px-8 py-5 text-left text-lg font-semibold text-gray-700">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-8 py-6 font-medium text-gray-900">{item.name}</td>
                      <td className="px-8 py-6 text-gray-700">{item.units.toFixed(4)}</td>
                      <td className="px-8 py-6 text-gray-700">${item.invested.toLocaleString()}</td>
                      <td className="px-8 py-6 text-gray-700">${item.currentValue.toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <span className={item.change.startsWith('+') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {item.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right text-3xl font-bold text-vault-primary">
              Total Portfolio Value: {getTotalValue()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio