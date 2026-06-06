'use client'
import { useRef, useState } from 'react'
import type { CharacterData, VisualStyle, TechnicalStyle } from '@/lib/types'

type ParsedFields = Partial<Pick<CharacterData, 'subjectDescription' | 'wardrobe' | 'mood' | 'setting' | 'visualStyle' | 'technicalStyle'>>
type ParseState = 'idle' | 'parsing' | 'preview' | 'error'

const VALID_VISUAL_STYLES: VisualStyle[] = ['photorealistic', 'anime-painterly', 'cel-shaded-3d', 'stylized-3d']
const VALID_TECHNICAL_STYLES: TechnicalStyle[] = ['kodak-portra', 'anime', 'cel']

// ── Client-side keyword extractor ────────────────────────────────────────────

const FIELD_KEYWORDS: Array<{ keys: string[]; field: keyof ParsedFields }> = [
  { keys: ['physical description', 'appearance', 'physical', 'description', 'character description', 'subject', 'looks', 'physical traits'], field: 'subjectDescription' },
  { keys: ['wardrobe', 'costume', 'clothing', 'outfit', 'attire', 'wears', 'dress'], field: 'wardrobe' },
  { keys: ['mood', 'personality', 'core mood', 'character traits', 'temperament', 'nature', 'emotional state', 'traits'], field: 'mood' },
  { keys: ['setting', 'location', 'environment', 'world', 'scene', 'place', 'time period', 'backdrop'], field: 'setting' },
]

const VISUAL_STYLE_HINTS: Array<{ words: string[]; value: VisualStyle }> = [
  { words: ['anime', 'manga', 'painterly', 'painted', 'hand-drawn'], value: 'anime-painterly' },
  { words: ['cel-shaded', 'cel shaded', 'toon shaded'], value: 'cel-shaded-3d' },
  { words: ['stylized 3d', 'stylized-3d', 'semi-realistic 3d'], value: 'stylized-3d' },
  { words: ['photorealistic', 'live action', 'cinematic', 'realistic', 'film'], value: 'photorealistic' },
]

const TECHNICAL_STYLE_HINTS: Array<{ words: string[]; value: TechnicalStyle }> = [
  { words: ['anime', 'animation style'], value: 'anime' },
  { words: ['cel', 'cel-shaded'], value: 'cel' },
  { words: ['kodak', 'film grain', 'portra', '35mm', 'photographic'], value: 'kodak-portra' },
]

function extractLine(text: string, keywords: string[]): string {
  const lines = text.split('\n')
  for (const keyword of keywords) {
    for (const line of lines) {
      // Strip markdown bold/italic/heading markers for matching
      const stripped = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/__/g, '').trim()
      const lower = stripped.toLowerCase()
      const kwLower = keyword.toLowerCase()

      // Match "Keyword: value" or "Keyword values:" or "# Keyword"
      if (lower.startsWith(kwLower + ':') || lower.startsWith(kwLower + 's:') || lower.startsWith(kwLower + ' -')) {
        const colonIdx = stripped.indexOf(':')
        const dashIdx = stripped.indexOf(' -')
        const splitAt = colonIdx !== -1 ? colonIdx : dashIdx !== -1 ? dashIdx + 1 : -1
        if (splitAt !== -1) {
          const value = stripped.slice(splitAt + 1).replace(/\*\*/g, '').trim()
          if (value.length > 4) return value
        }
      }
    }
  }
  return ''
}

function inferVisualStyle(text: string): VisualStyle | undefined {
  const lower = text.toLowerCase()
  for (const { words, value } of VISUAL_STYLE_HINTS) {
    if (words.some(w => lower.includes(w))) return value
  }
  return undefined
}

function inferTechnicalStyle(text: string): TechnicalStyle | undefined {
  const lower = text.toLowerCase()
  for (const { words, value } of TECHNICAL_STYLE_HINTS) {
    if (words.some(w => lower.includes(w))) return value
  }
  return undefined
}

function parseClientSide(text: string): ParsedFields {
  const result: ParsedFields = {}
  for (const { keys, field } of FIELD_KEYWORDS) {
    const value = extractLine(text, keys)
    if (value) result[field] = value as never
  }
  const vs = inferVisualStyle(text)
  if (vs) result.visualStyle = vs
  const ts = inferTechnicalStyle(text)
  if (ts) result.technicalStyle = ts
  return result
}

function countFields(fields: ParsedFields): number {
  return Object.values(fields).filter(v => v && String(v).length > 0).length
}

async function readPdfAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ── Preview field labels ──────────────────────────────────────────────────────

const PREVIEW_FIELDS: Array<{ key: keyof ParsedFields; label: string }> = [
  { key: 'subjectDescription', label: 'Subject Description' },
  { key: 'wardrobe', label: 'Wardrobe' },
  { key: 'mood', label: 'Mood' },
  { key: 'setting', label: 'Setting' },
  { key: 'visualStyle', label: 'Visual Style' },
  { key: 'technicalStyle', label: 'Technical Style' },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onApply: (fields: ParsedFields) => void
}

export function CharacterBibleImport({ onApply }: Props) {
  const [state, setState] = useState<ParseState>('idle')
  const [preview, setPreview] = useState<ParsedFields | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setState('idle')
    setPreview(null)
    setError('')
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setState('parsing')
    setPreview(null)
    setError('')

    try {
      if (file.type === 'application/pdf') {
        const pdfBase64 = await readPdfAsBase64(file)
        const res = await fetch('/api/parse-bible', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfBase64 }),
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json() as ParsedFields
        setPreview(sanitize(data))
      } else {
        const text = await file.text()
        const clientResult = parseClientSide(text)

        if (countFields(clientResult) >= 2) {
          setPreview(clientResult)
        } else {
          // Fall back to Claude
          const res = await fetch('/api/parse-bible', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          })
          if (!res.ok) throw new Error(await res.text())
          const data = await res.json() as ParsedFields
          setPreview(sanitize(data))
        }
      }
      setState('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed')
      setState('error')
    }
  }

  // Validate enum values returned by the API
  const sanitize = (data: ParsedFields): ParsedFields => ({
    ...data,
    visualStyle: VALID_VISUAL_STYLES.includes(data.visualStyle as VisualStyle)
      ? data.visualStyle : undefined,
    technicalStyle: VALID_TECHNICAL_STYLES.includes(data.technicalStyle as TechnicalStyle)
      ? data.technicalStyle : undefined,
  })

  const apply = () => {
    if (preview) {
      // Strip empty strings before applying
      const cleaned = Object.fromEntries(
        Object.entries(preview).filter(([, v]) => v && String(v).length > 0)
      ) as ParsedFields
      onApply(cleaned)
      reset()
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        marginBottom: '1.25rem',
        overflow: 'hidden',
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1rem',
          background: 'var(--color-bg-card)',
          borderBottom: state !== 'idle' ? '1px solid var(--color-border-dim)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
              fontWeight: 600,
            }}
          >
            ◈ Import from Character Bible
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              color: 'var(--color-text-dim)',
              opacity: 0.45,
              letterSpacing: '0.08em',
            }}
          >
            optional · .txt .md .pdf
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {state !== 'idle' && (
            <button
              onClick={reset}
              style={{
                fontSize: '0.62rem',
                color: 'var(--color-text-dim)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              ✕ clear
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={state === 'parsing'}
            style={{
              padding: '0.28rem 0.65rem',
              background: state === 'parsing' ? 'transparent' : 'var(--color-gold-muted)',
              border: '1px solid var(--color-gold-dim)',
              borderRadius: '3px',
              color: 'var(--color-gold)',
              fontWeight: 700,
              fontSize: '0.62rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: state === 'parsing' ? 'not-allowed' : 'pointer',
              opacity: state === 'parsing' ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {state === 'parsing' ? '● PARSING...' : '↑ SELECT FILE'}
          </button>
        </div>
      </div>

      {/* ── Parsing indicator ── */}
      {state === 'parsing' && (
        <div
          style={{
            padding: '0.6rem 1rem',
            background: 'var(--color-bg-input)',
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Reading <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>{fileName}</strong>
          <span style={{ color: 'var(--color-gold)', marginLeft: '0.35rem' }}>···</span>
        </div>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div
          style={{
            padding: '0.6rem 1rem',
            background: 'var(--color-bg-input)',
            fontSize: '0.7rem',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Preview ── */}
      {state === 'preview' && preview && (
        <div style={{ padding: '0.9rem 1rem', background: 'var(--color-bg-input)' }}>
          <div
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
              marginBottom: '0.7rem',
            }}
          >
            Extracted from {fileName}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.9rem' }}>
            {PREVIEW_FIELDS.map(({ key, label }) => {
              const value = preview[key]
              if (!value) return null
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr',
                    gap: '0.5rem',
                    alignItems: 'start',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--color-text-dim)',
                      letterSpacing: '0.05em',
                      paddingTop: '0.1rem',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text)',
                      lineHeight: 1.45,
                    }}
                  >
                    {String(value)}
                  </span>
                </div>
              )
            })}
          </div>

          {countFields(preview) === 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem' }}>
              No recognizable fields found. Try a different file.
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={apply}
              disabled={countFields(preview) === 0}
              style={{
                padding: '0.38rem 0.85rem',
                background: countFields(preview) === 0 ? 'var(--color-bg-card)' : 'var(--color-gold)',
                border: 'none',
                borderRadius: '3px',
                color: countFields(preview) === 0 ? 'var(--color-text-dim)' : '#0a0a0a',
                fontWeight: 700,
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: countFields(preview) === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              ◈ APPLY TO BUILDER
            </button>
            <button
              onClick={reset}
              style={{
                padding: '0.38rem 0.85rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '3px',
                color: 'var(--color-text-dim)',
                fontSize: '0.68rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
