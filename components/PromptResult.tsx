'use client'
import { useState } from 'react'

interface PromptResultProps {
  prompt: string
  isGenerating: boolean
  moduleName: string
  targetTool: string
}

export function PromptResult({ prompt, isGenerating, moduleName, targetTool }: PromptResultProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!prompt) return
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isEmpty = !prompt && !isGenerating

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '400px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-card)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isGenerating
                ? 'var(--color-gold)'
                : prompt
                ? '#22c55e'
                : 'var(--color-border)',
              transition: 'background 0.3s',
              animation: isGenerating ? 'gold-pulse 1s ease-in-out infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}
          >
            {isGenerating ? 'GENERATING...' : prompt ? 'READY' : 'AWAITING INPUT'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'var(--color-text-dim)',
              textTransform: 'uppercase',
            }}
          >
            {targetTool}
          </span>
          <button
            onClick={copy}
            disabled={!prompt || isGenerating}
            style={{
              padding: '0.3rem 0.8rem',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              background: copied
                ? 'rgba(34, 197, 94, 0.15)'
                : !prompt
                ? 'transparent'
                : 'var(--color-gold-muted)',
              border: `1px solid ${copied ? '#22c55e' : !prompt ? 'var(--color-border)' : 'var(--color-gold)'}`,
              borderRadius: '3px',
              color: copied ? '#22c55e' : !prompt ? 'var(--color-text-dim)' : 'var(--color-gold)',
              cursor: prompt ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            {copied ? 'COPIED ✓' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          position: 'relative',
        }}
      >
        {isGenerating && (
          <div
            className="scanline"
            style={{ position: 'absolute', left: 0, right: 0, zIndex: 2 }}
          />
        )}

        {isEmpty ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '1rem',
              opacity: 0.4,
              paddingTop: '3rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              ◎
            </div>
            <p
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
              }}
            >
              Fill in {moduleName} fields
              <br />
              and hit Generate
            </p>
          </div>
        ) : (
          <p className="prompt-output" style={{ margin: 0 }}>
            {prompt}
            {isGenerating && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1em',
                  background: 'var(--color-gold)',
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'gold-pulse 0.8s ease-in-out infinite',
                }}
              />
            )}
          </p>
        )}
      </div>

      {/* Word count */}
      {prompt && (
        <div
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid var(--color-border-dim)',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)' }}>
            {prompt.split(/\s+/).filter(Boolean).length} words ·{' '}
            {prompt.length} chars
          </span>
        </div>
      )}
    </div>
  )
}
