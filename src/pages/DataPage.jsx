import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { demoFoodEntries } from '../data/foodEntries'
import { listMeals, toDisplayEntries } from '../services/nutrition'

const formatDatetime = (datetime) => new Date(datetime).toLocaleString('en-IE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function DataPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [entries, setEntries] = useState(
    user?.isDemo ? [...demoFoodEntries].sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) : []
  )
  const [loading, setLoading] = useState(!user?.isDemo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.isDemo) return undefined
    let active = true
    listMeals()
      .then((rows) => {
        if (active) setEntries(toDisplayEntries(rows))
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.status === 401) {
          logout()
          navigate('/', { replace: true })
          return
        }
        setError(requestError.message || 'Could not load food entries.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.isDemo, logout, navigate])

  return (
    <main className="content-page">
      <div className="content-inner">
        <h1>Data</h1>
        <p>Recent food entries.</p>
        {error && <p className="content-error" role="alert">{error}</p>}
        <div className="data-table-wrap">
          <table className="data-table">
            <colgroup>
              <col className="data-col-datetime" />
              <col />
              <col className="data-col-number" />
              <col className="data-col-number" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Datetime</th>
                <th scope="col">Food</th>
                <th scope="col">Calories</th>
                <th scope="col">Protein</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id || `${entry.datetime}-${entry.food}`}>
                  <td>{formatDatetime(entry.datetime)}</td>
                  <td><span className="data-food" title={entry.food}>{entry.food}</span></td>
                  <td>{entry.calories}</td>
                  <td>{entry.protein} g</td>
                </tr>
              ))}
              {!loading && !entries.length && (
                <tr><td colSpan="4">No food entries yet.</td></tr>
              )}
              {loading && (
                <tr><td colSpan="4">Loading food entries…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default DataPage
