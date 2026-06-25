import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_ENDPOINTS, authFetch } from '../config/api'
import './HubPage.css'

const DAY_MS = 86400000
const GLASS_ML = 250
const PINT_ML = 568
const CAL_SNACK_KCAL = 100
const CAL_LIGHT_MEAL_KCAL = 250
const CAL_MEAL_KCAL = 500

function formatYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function parseJsonSafe(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

function trailingDays(count, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const out = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setTime(end.getTime() - i * DAY_MS)
    out.push(formatYmd(d))
  }
  return out
}

function MetricChart({ title, values, unit }) {
  const width = 560
  const height = 180
  const pad = 20

  const points = useMemo(() => {
    const withValue = values
      .map((v, i) => ({ value: v, idx: i }))
      .filter((x) => typeof x.value === 'number' && Number.isFinite(x.value))
    if (withValue.length === 0) return { pts: [], min: 0, max: 1 }

    const nums = withValue.map((x) => x.value)
    let min = Math.min(...nums)
    let max = Math.max(...nums)
    if (min === max) {
      min = min - 1
      max = max + 1
    }

    const xStep = (width - pad * 2) / Math.max(1, values.length - 1)
    const yScale = (height - pad * 2) / (max - min)

    const pts = withValue.map((x) => {
      const px = pad + x.idx * xStep
      const py = height - pad - (x.value - min) * yScale
      return { x: px, y: py, value: x.value }
    })
    return { pts, min, max }
  }, [values])

  const polyline = points.pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <section className="hub-card" aria-label={title}>
      <h2>{title}</h2>
      {points.pts.length === 0 ? (
        <p>No data yet. Start by logging today's value above.</p>
      ) : (
        <div className="hub-chart-wrap">
          <svg
            className="hub-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${title} trend`}
          >
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="hub-chart-axis" />
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="hub-chart-axis" />
            <polyline points={polyline} fill="none" className="hub-chart-line" />
            {points.pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.2" className="hub-chart-dot">
                <title>{`${p.value}${unit}`}</title>
              </circle>
            ))}
          </svg>
          <div className="hub-chart-meta">
            <span>{`${Math.round(points.min * 10) / 10}${unit}`}</span>
            <span>{`${Math.round(points.max * 10) / 10}${unit}`}</span>
          </div>
        </div>
      )}
    </section>
  )
}

function Calories() {
  const { user } = useAuth()
  const email = user?.email || ''
  const today = useMemo(() => formatYmd(new Date()), [])
  const [history, setHistory] = useState({})
  const [caloriesAddInput, setCaloriesAddInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [waterCustomInput, setWaterCustomInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email) {
      setHistory({})
      setCaloriesAddInput('')
      setWeightInput('')
      setWaterCustomInput('')
      return
    }
    const load = async () => {
      try {
        const res = await authFetch(API_ENDPOINTS.USER_NUTRITION, { method: 'GET' })
        const data = await parseJsonSafe(res)
        if (!res.ok) throw new Error(data.error || `Could not load nutrition (${res.status})`)
        const next = data.history && typeof data.history === 'object' ? data.history : {}
        setError('')
        setHistory(next)
        const todayRow = next[today] || {}
        setCaloriesAddInput('')
        setWeightInput(
          typeof todayRow.weight === 'number' && Number.isFinite(todayRow.weight)
            ? String(todayRow.weight)
            : ''
        )
        setWaterCustomInput('')
      } catch (e) {
        setError(e.message || 'Failed to load nutrition data')
        setHistory({})
        setCaloriesAddInput('')
        setWeightInput('')
        setWaterCustomInput('')
      }
    }
    void load()
  }, [email, today])

  const persistHistory = async (next) => {
    setHistory(next)
    if (!email) return
    const res = await authFetch(API_ENDPOINTS.USER_NUTRITION, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: next }),
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) throw new Error(data.error || `Could not save nutrition (${res.status})`)
    return data.history && typeof data.history === 'object' ? data.history : next
  }

  const updateToday = (patch) => {
    const current = history[today] && typeof history[today] === 'object' ? history[today] : {}
    const row = { ...current, ...patch }
    if (row.calories == null) delete row.calories
    if (row.weight == null) delete row.weight
    if (row.waterMl == null) delete row.waterMl
    const next = { ...history }
    if (Object.keys(row).length === 0) delete next[today]
    else next[today] = row
    void (async () => {
      try {
        setError('')
        const persisted = await persistHistory(next)
        setHistory(persisted)
      } catch (e) {
        setError(e.message || 'Failed to save nutrition data')
      }
    })()
  }

  const dayKeys = useMemo(() => trailingDays(30), [])
  const calorieSeries = useMemo(
    () => dayKeys.map((k) => (typeof history[k]?.calories === 'number' ? history[k].calories : null)),
    [dayKeys, history]
  )
  const weightSeries = useMemo(
    () => dayKeys.map((k) => (typeof history[k]?.weight === 'number' ? history[k].weight : null)),
    [dayKeys, history]
  )
  const waterSeries = useMemo(
    () => dayKeys.map((k) => (typeof history[k]?.waterMl === 'number' ? history[k].waterMl : null)),
    [dayKeys, history]
  )
  const todayCalories =
    typeof history[today]?.calories === 'number' && Number.isFinite(history[today].calories)
      ? Math.round(history[today].calories)
      : 0
  const todayWaterMl = typeof history[today]?.waterMl === 'number' ? history[today].waterMl : 0

  const addCalories = (kcalToAdd) => {
    if (!Number.isFinite(kcalToAdd) || kcalToAdd <= 0) return
    updateToday({ calories: todayCalories + Math.round(kcalToAdd) })
  }

  const addWater = (mlToAdd) => {
    if (!Number.isFinite(mlToAdd) || mlToAdd <= 0) return
    updateToday({ waterMl: todayWaterMl + Math.round(mlToAdd) })
  }

  return (
    <main className="hub-page">
      <div className="hub-inner">
        <header className="hub-header">
          <h1 className="hub-title">Calorie tracking</h1>
          <p className="hub-sub">
            Track intake, set targets, and keep nutrition progress visible in one place.
          </p>
        </header>

        <p className="hub-body">
          Log calories incrementally and record body weight for the day. Meal and nutrient breakdown can be added
          later. You can also track water intake in ml.
        </p>
        {error ? <p className="hub-body">{error}</p> : null}

        <section className="hub-card" aria-label="Calorie tracking">
          <h2>Calories ({today})</h2>
          <div className="hub-form-grid">
            <p className="hub-water-total">
              Today: <strong>{todayCalories} kcal</strong>
            </p>
            <div className="hub-water-actions">
              <button
                type="button"
                className="hub-btn"
                data-testid="calories-add-snack"
                onClick={() => addCalories(CAL_SNACK_KCAL)}
              >
                +{CAL_SNACK_KCAL} kcal
              </button>
              <button
                type="button"
                className="hub-btn"
                data-testid="calories-add-light-meal"
                onClick={() => addCalories(CAL_LIGHT_MEAL_KCAL)}
              >
                +{CAL_LIGHT_MEAL_KCAL} kcal
              </button>
              <button
                type="button"
                className="hub-btn"
                data-testid="calories-add-meal"
                onClick={() => addCalories(CAL_MEAL_KCAL)}
              >
                +{CAL_MEAL_KCAL} kcal
              </button>
            </div>
            <div className="hub-water-custom">
              <input
                className="hub-input"
                type="number"
                data-testid="calories-add-input"
                min="1"
                step="1"
                placeholder="Calories to add"
                value={caloriesAddInput}
                onChange={(e) => setCaloriesAddInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  const n = Number.parseInt(caloriesAddInput, 10)
                  if (Number.isFinite(n) && n > 0) {
                    addCalories(n)
                    setCaloriesAddInput('')
                  }
                }}
              />
              <button
                type="button"
                className="hub-btn"
                data-testid="calories-add-btn"
                onClick={() => {
                  const n = Number.parseInt(caloriesAddInput, 10)
                  if (Number.isFinite(n) && n > 0) {
                    addCalories(n)
                    setCaloriesAddInput('')
                  }
                }}
              >
                Add calories
              </button>
            </div>
          </div>
        </section>

        <section className="hub-card" aria-label="Weight">
          <h2>Weight ({today})</h2>
          <div className="hub-form-grid">
            <label className="hub-field">
              <span>Weight (kg)</span>
              <input
                className="hub-input"
                type="number"
                data-testid="weight-input"
                min="0"
                step="0.1"
                placeholder="e.g. 78.4"
                value={weightInput}
                onChange={(e) => {
                  const v = e.target.value
                  setWeightInput(v)
                  if (v === '') updateToday({ weight: null })
                  else {
                    const n = Number.parseFloat(v)
                    if (Number.isFinite(n) && n > 0) updateToday({ weight: Math.round(n * 10) / 10 })
                  }
                }}
              />
            </label>
          </div>
        </section>

        <section className="hub-card" aria-label="Water tracking">
          <h2>Water ({today})</h2>
          <div className="hub-form-grid">
            <p className="hub-water-total">
              Today: <strong>{todayWaterMl} ml</strong>
            </p>
            <div className="hub-water-actions">
              <button type="button" className="hub-btn" data-testid="water-add-glass" onClick={() => addWater(GLASS_ML)}>
                +1 glass ({GLASS_ML} ml)
              </button>
              <button type="button" className="hub-btn" data-testid="water-add-pint" onClick={() => addWater(PINT_ML)}>
                +1 pint ({PINT_ML} ml)
              </button>
            </div>
            <div className="hub-water-custom">
              <input
                className="hub-input"
                type="number"
                data-testid="water-custom-ml"
                min="1"
                step="1"
                placeholder="Custom ml amount"
                value={waterCustomInput}
                onChange={(e) => setWaterCustomInput(e.target.value)}
              />
              <button
                type="button"
                className="hub-btn"
                data-testid="water-add-custom"
                onClick={() => {
                  const n = Number.parseInt(waterCustomInput, 10)
                  if (Number.isFinite(n) && n > 0) {
                    addWater(n)
                    setWaterCustomInput('')
                  }
                }}
              >
                Add custom ml
              </button>
            </div>
          </div>
        </section>

        <MetricChart title="Calories trend (last 30 days)" values={calorieSeries} unit=" kcal" />
        <MetricChart title="Weight trend (last 30 days)" values={weightSeries} unit=" kg" />
        <MetricChart title="Water trend (last 30 days)" values={waterSeries} unit=" ml" />
      </div>
    </main>
  )
}

export default Calories
