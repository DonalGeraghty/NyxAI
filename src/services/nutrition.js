import { API_ENDPOINTS, authFetch } from '../config/api'

export class NutritionApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'NutritionApiError'
    this.status = status
    this.code = code
  }
}

async function nutritionRequest(path, options) {
  const response = await authFetch(path, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new NutritionApiError(
      data.message || data.error || 'Nutrition request failed',
      response.status,
      data.error
    )
  }

  return data
}

export async function analyzeMeal(message) {
  const data = await nutritionRequest(API_ENDPOINTS.NUTRITION_ANALYZE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return data.analysis
}

export async function logMeal(items, sourceMessage) {
  const data = await nutritionRequest(API_ENDPOINTS.NUTRITION_ENTRIES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      source_message: sourceMessage,
      eaten_at: new Date().toISOString(),
    }),
  })
  return data.entry
}

export async function listMeals(limit = 100) {
  const data = await nutritionRequest(
    `${API_ENDPOINTS.NUTRITION_ENTRIES}?limit=${limit}`,
    { method: 'GET' }
  )
  return data.entries || []
}

export function toDisplayEntries(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    datetime: entry.eaten_at,
    food: (entry.items || [])
      .map((item) => `${item.food} (${item.portion})`)
      .join(', '),
    calories: entry.total_calories,
    protein: entry.total_protein_g,
  }))
}
