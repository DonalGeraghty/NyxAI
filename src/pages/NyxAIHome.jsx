import React, { useState } from 'react'
import Lightfall from '../components/Lightfall'

const LIGHTFALL_COLORS = ['#ffffff', '#b8b8b8', '#6f6f6f']

function NyxAIHome() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    setResponse('AI responses will appear here once the service is connected.')
    setMessage('')
  }

  return (
    <main className="hub-page nyxai-home">
      <Lightfall
        colors={LIGHTFALL_COLORS}
        backgroundColor="#000000"
        speed={0.3}
        streakCount={4}
        streakWidth={0.7}
        streakLength={1.4}
        glow={0.55}
        density={0.5}
        twinkle={0.45}
        backgroundGlow={0.05}
        opacity={0.6}
        mouseStrength={0.25}
      />
      <div className="hub-inner">
        <header className="hub-header">
          <h1 className="hub-title">NyxAI</h1>
        </header>

        <form className="message-composer" onSubmit={handleSubmit}>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault()
                event.currentTarget.form.requestSubmit()
              }
            }}
            placeholder="I ate an apple…"
            rows="5"
          />
          <button type="submit" disabled={!message.trim()}>Send</button>
        </form>

        {response && (
          <section className="message-response" aria-live="polite">
            <h2>Response</h2>
            <p>{response}</p>
          </section>
        )}
      </div>
    </main>
  )
}

export default NyxAIHome
