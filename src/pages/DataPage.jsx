import React from 'react'

const entries = [
  { datetime: '2026-07-22T08:15:00', food: 'Porridge with berries', calories: 340, protein: '14 g' },
  { datetime: '2026-07-22T12:30:00', food: 'Chicken salad', calories: 480, protein: '42 g' },
  { datetime: '2026-07-22T15:45:00', food: 'Greek yoghurt', calories: 160, protein: '17 g' },
  { datetime: '2026-07-22T19:10:00', food: 'Salmon, rice and vegetables', calories: 620, protein: '46 g' },
].sort((a, b) => new Date(b.datetime) - new Date(a.datetime))

const formatDatetime = (datetime) => new Date(datetime).toLocaleString('en-IE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function DataPage() {
  return (
    <main className="content-page">
      <div className="content-inner">
        <h1>Data</h1>
        <p>Recent food entries.</p>
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
                <tr key={`${entry.datetime}-${entry.food}`}>
                  <td>{formatDatetime(entry.datetime)}</td>
                  <td>
                    <span className="data-food" title={entry.food}>{entry.food}</span>
                  </td>
                  <td>{entry.calories}</td>
                  <td>{entry.protein}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default DataPage
