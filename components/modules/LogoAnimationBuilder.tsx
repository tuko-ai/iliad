'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormField, Input, Textarea } from '@/components/FormField'
import { PromptResult } from '@/components/PromptResult'
import { ImageUpload } from '@/components/ImageUpload'

const ENVIRONMENT_PLACEHOLDERS = [
  'Volcanic crater rim at dawn, ember drift',
  'Deep ocean trench, bioluminescent particles',
  'Frozen arctic tundra, aurora sky',
  'Desert salt flat, heat mirage',
  'Ancient forest canopy, mist and shafts of light',
  'Storm cell interior, lightning scaffold',
  'Abandoned cathedral, shattered rose window light',
  'Zero-gravity orbital station, Earth below',
  'Underground cave system, crystal formations',
  'Neon-lit rain-soaked city intersection, midnight',
]

export default function LogoAnimationBuilder() {
  const { logoData, updateLogoData } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [localPrompt, setLocalPrompt] = useState(logoData.generatedPrompt)

  const setEnv = (i: number, value: string) => {
    const updated = [...logoData.environments]
    updated[i] = value
    updateLogoData({ environments: updated })
  }

  const generate = async () => {
    if (!logoData.logoDescription.trim()) return
    setIsGenerating(true)
    setLocalPrompt('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'logo', ...logoData }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setLocalPrompt(full)
      }
      updateLogoData({ generatedPrompt: full })
    } catch (err) {
      setLocalPrompt('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="module-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Form */}
      <div
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '1.5rem',
        }}
      >
        <SectionLabel>Logo Identity</SectionLabel>

        <ImageUpload
          label="Logo Image"
          hint="Upload your logo — Claude analyzes the graphic design and references it throughout the animation prompt"
          refTag="@[logo ref]"
          value={logoData.logoImageRef}
          onChange={(ref) => updateLogoData({ logoImageRef: ref })}
        />

        <FormField
          label="Logo Description"
          hint="Shape, typography, symbolism, color, material, scale"
          required
        >
          <Textarea
            rows={4}
            placeholder="A minimalist ouroboros formed from a single gold line. The snake's body becomes a film reel strip at the midpoint. Clean, geometric, slightly worn texture. Set against deep void black. The word ILIAD appears below in condensed serif, letter-spaced at 0.4em."
            value={logoData.logoDescription}
            onChange={(e) => updateLogoData({ logoDescription: e.target.value })}
          />
        </FormField>

        <div className="section-divider" />
        <SectionLabel>10-Beat Environment Sequence</SectionLabel>

        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Each environment hosts one beat of the logo's cinematic reveal. The logo
          materializes, transforms, or emerges from each setting in sequence.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--color-gold)',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  textAlign: 'right',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <Input
                placeholder={ENVIRONMENT_PLACEHOLDERS[i]}
                value={logoData.environments[i] || ''}
                onChange={(e) => setEnv(i, e.target.value)}
                style={{ fontSize: '0.78rem' }}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.85rem',
            background: 'rgba(124, 92, 191, 0.08)',
            border: '1px solid rgba(124, 92, 191, 0.25)',
            borderRadius: '4px',
            fontSize: '0.7rem',
            color: 'rgba(124, 92, 191, 0.9)',
            lineHeight: 1.5,
          }}
        >
          The final prompt will choreograph camera movement, lighting transitions,
          and logo materialization across all 10 beats as a continuous Seedance 2.0 sequence.
        </div>

        <button
          onClick={generate}
          disabled={isGenerating || !logoData.logoDescription.trim()}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            background: isGenerating ? 'var(--color-bg-input)' : 'var(--color-gold)',
            border: 'none',
            borderRadius: '4px',
            color: isGenerating ? 'var(--color-gold)' : '#0a0a0a',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: isGenerating || !logoData.logoDescription.trim() ? 'not-allowed' : 'pointer',
            opacity: !logoData.logoDescription.trim() ? 0.4 : 1,
            transition: 'all 0.15s',
          }}
        >
          {isGenerating ? '● GENERATING...' : '◈ GENERATE LOGO ANIMATION PROMPT'}
        </button>
      </div>

      {/* Result */}
      <PromptResult
        prompt={localPrompt}
        isGenerating={isGenerating}
        moduleName="Logo Animation Builder"
        targetTool="SEEDANCE 2.0"
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--color-text-dim)',
        marginBottom: '0.85rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid var(--color-border-dim)',
      }}
    >
      {children}
    </div>
  )
}
