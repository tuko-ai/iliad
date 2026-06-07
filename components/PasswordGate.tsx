'use client'
import { useState, useEffect, useRef } from 'react'

const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD
const STORAGE_KEY = 'iliad_auth'

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [checked, setChecked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!PASSWORD) {
      setUnlocked(true)
      setChecked(true)
      return
    }
    if (localStorage.getItem(STORAGE_KEY) === PASSWORD) {
      setUnlocked(true)
    }
    setChecked(true)
  }, [])

  useEffect(() => {
    if (checked && !unlocked) inputRef.current?.focus()
  }, [checked, unlocked])

  const submit = () => {
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, PASSWORD)
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 1200)
    }
  }

  if (!checked) return null

  if (unlocked) return <>{children}</>

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          padding: '2.5rem',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '0.4em',
              color: 'var(--color-gold)',
              margin: '0 0 0.5rem',
              textShadow: '0 0 28px rgba(201, 162, 39, 0.4)',
            }}
          >
            ILIAD
          </h1>
          <p
            style={{
              fontSize: '0.57rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
              margin: 0,
            }}
          >
            AI Filmmaking Pipeline
          </p>
        </div>

        {/* Password input */}
        <div style={{ width: '100%', marginBottom: '0.75rem' }}>
          <input
            ref={inputRef}
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="access code"
            className="iliad-input"
            style={{
              textAlign: 'center',
              letterSpacing: '0.25em',
              borderColor: error ? 'var(--color-red-ember)' : undefined,
            }}
          />
          <p
            style={{
              fontSize: '0.6rem',
              color: 'var(--color-red-ember)',
              textAlign: 'center',
              margin: '0.5rem 0 0',
              letterSpacing: '0.1em',
              opacity: error ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          >
            INCORRECT ACCESS CODE
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          style={{
            width: '100%',
            padding: '0.65rem',
            background: 'var(--color-gold)',
            border: 'none',
            borderRadius: '4px',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ◈ ENTER
        </button>
      </div>
    </div>
  )
}
