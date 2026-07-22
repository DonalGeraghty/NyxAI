import React, { useState } from 'react'
import GooeyButton from '../components/GooeyButton'
import SoftAurora from '../components/SoftAurora'

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
      <SoftAurora
        brightness={0.65}
        color1="#5537a5"
        color2="#286b88"
        speed={0.35}
        mouseInfluence={0.12}
      />
      <div className="hub-inner">
        <header className="hub-header">
          <h1 className="hub-title">NyxAI</h1>
          <p className="hub-sub">What would you like to explore?</p>
        </header>

        <form className="message-composer" onSubmit={handleSubmit}>
          <label htmlFor="message">Message</label>
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
            placeholder="Ask Nyx anything…"
            rows="5"
          />
          <GooeyButton type="submit" disabled={!message.trim()}>Send</GooeyButton>
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
