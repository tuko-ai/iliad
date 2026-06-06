'use client'
import { useRef, useState } from 'react'
import type { StoryboardData } from '@/lib/types'

type ParsedSceneFields = Partial<Pick<StoryboardData,
  | 'projectTitle' | 'metaLine' | 'microBrief' | 'genreTone'
  | 'scenePremise' | 'location' | 'startToEnd' | 'actionChain'
  | 'mustRead' | 'emotionalArc' | 'characterSlotA' | 'characterSlotB'
>>

type ParseState = 'idle' | 'parsing' | 'preview' | 'error'

interface PreviewField {
  key: keyof ParsedSceneFields
  label: string
  multiline?: boolean
}

const PREVIEW_FIELDS: PreviewField[] = [
  { key: 'projectTitle', label: 'Project Title' },
  { key: 'location', label: 'Location' },
  { key: 'genreTone', label: 'Genre / Tone' },
  { key: 'characterSlotA', label: 'Character A' },
  { key: 'characterSlotB', label: 'Character B' },
  { key: 'scenePremise', label: 'Scene Premise', multiline: true },
  { key: 'actionChain', label: 'Action Chain', multiline: true },
  { key: 'startToEnd', label: 'Start → End' },
  { key: 'mustRead', label: 'Must Read' },
  { key: 'emotionalArc', label: 'Emotional Arc' },
  { key: 'metaLine', label: 'Meta Line' },
  { key: 'microBrief', label: 'Micro Brief', multiline: true },
]

// ── Fountain / plain-text parser ──────────────────────────────────────────────

function cap(s: string, n: number) { return s.length <= n ? s : s.slice(0, n).trimEnd() + '…' }

const HEADING_RE = /^(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s+/i
// Words that look like ALL-CAPS but are actually Fountain transitions or titles
const SKIP_CAPS = /^(FADE (IN|OUT|TO)|CUT TO|SMASH CUT|DISSOLVE|TITLE CARD|THE END|BACK TO|MATCH CUT|INTERCUT)/i

function parseFountainText(text: string, fileName: string): ParsedSceneFields {
  const result: ParsedSceneFields = {}
  const rawLines = text.split(/\r?\n/)

  const headings: string[] = []
  const characters: string[] = []
  const actionLines: string[] = []
  const dialogueLines: string[] = []

  let i = 0
  while (i < rawLines.length) {
    const line = rawLines[i].trim()

    if (!line) { i++; continue }

    // Scene heading
    if (HEADING_RE.test(line)) {
      const heading = line.replace(HEADING_RE, '').trim()
      if (heading) headings.push(heading)
      i++; continue
    }

    // Character cue: ALL CAPS, preceded by blank line, not a transition/slug
    const prevBlank = i === 0 || rawLines[i - 1].trim() === ''
    const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line)
    const isShort = line.length >= 2 && line.length <= 40

    if (prevBlank && isAllCaps && isShort && !SKIP_CAPS.test(line) && !HEADING_RE.test(line)) {
      const name = line.replace(/\s*\(.*?\)\s*$/, '').trim()
      if (name && !characters.includes(name)) characters.push(name)
      i++
      // Collect dialogue + parentheticals
      while (i < rawLines.length) {
        const next = rawLines[i].trim()
        if (!next) break
        if (!(next.startsWith('(') && next.endsWith(')'))) {
          dialogueLines.push(next)
        }
        i++
      }
      continue
    }

    // Action line
    if (line.length > 8 && !SKIP_CAPS.test(line)) actionLines.push(line)
    i++
  }

  // Map to storyboard fields
  if (headings.length > 0) result.location = headings[0]

  if (actionLines.length > 0) {
    result.scenePremise = actionLines.slice(0, 2).join(' ')
    if (actionLines.length > 2) {
      result.actionChain = actionLines
        .slice(2, 8)
        .map(l => cap(l, 60))
        .join(' → ')
    }
    result.startToEnd = `${cap(actionLines[0], 70)} → ${cap(actionLines[actionLines.length - 1], 70)}`
  }

  if (characters.length > 0) {
    result.characterSlotA = characters[0]
    if (characters.length > 1) result.characterSlotB = characters[1]
  }

  if (dialogueLines.length > 0) {
    result.mustRead = dialogueLines.slice(0, 3).join(' / ')
  }

  // Derive title from filename (last resort — Claude will improve it in API fallback)
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim().toUpperCase()
  if (base.length > 1 && base.length < 60) result.projectTitle = base

  return result
}

function parseFdxText(text: string, fileName: string): ParsedSceneFields {
  // Convert Final Draft XML to fountain-like text by extracting element content
  const converted = text
    .replace(/<SceneHeading[^>]*>([\s\S]*?)<\/SceneHeading>/gi, (_m, c: string) =>
      `\nINT. ${stripXml(c)}\n`)
    .replace(/<Character[^>]*>([\s\S]*?)<\/Character>/gi, (_m, c: string) =>
      `\n${stripXml(c).toUpperCase()}\n`)
    .replace(/<Action[^>]*>([\s\S]*?)<\/Action>/gi, (_m, c: string) =>
      `\n${stripXml(c)}\n`)
    .replace(/<Parenthetical[^>]*>([\s\S]*?)<\/Parenthetical>/gi, (_m, c: string) =>
      `\n(${stripXml(c).replace(/^\(|\)$/g, '')})\n`)
    .replace(/<Dialogue[^>]*>([\s\S]*?)<\/Dialogue>/gi, (_m, c: string) =>
      `\n${stripXml(c)}\n`)
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return parseFountainText(converted, fileName)
}

function stripXml(s: string) { return s.replace(/<[^>]+>/g, '').trim() }

// Keyword matcher for unstructured .txt/.md files (shot lists, etc.)
const KW_MAP: Array<{ keys: string[]; field: keyof ParsedSceneFields }> = [
  { keys: ['title', 'project', 'scene title', 'sequence'], field: 'projectTitle' },
  { keys: ['location', 'int.', 'ext.', 'place', 'setting', 'scene'], field: 'location' },
  { keys: ['genre', 'tone', 'genre/tone'], field: 'genreTone' },
  { keys: ['character a', 'character 1', 'protagonist', 'lead', 'hero', 'subject'], field: 'characterSlotA' },
  { keys: ['character b', 'character 2', 'antagonist', 'supporting'], field: 'characterSlotB' },
  { keys: ['premise', 'scene premise', 'overview', 'synopsis'], field: 'scenePremise' },
  { keys: ['action', 'action chain', 'beats', 'sequence'], field: 'actionChain' },
  { keys: ['start', 'start to end', 'arc', 'from', 'beginning'], field: 'startToEnd' },
  { keys: ['must read', 'key visual', 'important', 'critical'], field: 'mustRead' },
  { keys: ['emotional arc', 'emotion', 'feeling', 'mood arc'], field: 'emotionalArc' },
  { keys: ['meta', 'logline', 'thesis', 'meta line'], field: 'metaLine' },
  { keys: ['brief', 'micro brief', 'context', 'description'], field: 'microBrief' },
]

function extractKw(text: string, keywords: string[]): string {
  const lines = text.split('\n')
  for (const kw of keywords) {
    for (const line of lines) {
      const stripped = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/__/g, '').trim()
      const lower = stripped.toLowerCase()
      if (lower.startsWith(kw + ':') || lower.startsWith(kw + 's:')) {
        const val = stripped.slice(stripped.indexOf(':') + 1).trim()
        if (val.length > 3) return val
      }
    }
  }
  return ''
}

function parseKeywords(text: string): ParsedSceneFields {
  const result: ParsedSceneFields = {}
  for (const { keys, field } of KW_MAP) {
    const val = extractKw(text, keys)
    if (val) result[field] = val
  }
  return result
}

function countFields(f: ParsedSceneFields) {
  return Object.values(f).filter(v => typeof v === 'string' && v.length > 0).length
}

function merge(a: ParsedSceneFields, b: ParsedSceneFields): ParsedSceneFields {
  const result: ParsedSceneFields = { ...a }
  for (const k of Object.keys(b) as (keyof ParsedSceneFields)[]) {
    if (!result[k] && b[k]) result[k] = b[k] as never
  }
  return result
}

// ── API fallback: reuses the existing storyboard-parse module ─────────────────

async function parseViaApi(text: string): Promise<ParsedSceneFields> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module: 'storyboard-parse', screenplayInput: text }),
  })
  if (!res.ok) throw new Error('API parse failed')
  const json = await res.json()
  return (json && typeof json === 'object' ? json : {}) as ParsedSceneFields
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onApply: (fields: ParsedSceneFields) => void
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '3px',
  padding: '0.3rem 0.5rem',
  color: 'var(--color-text)',
  fontSize: '0.72rem',
  fontFamily: 'inherit',
  outline: 'none',
}

export function SceneImport({ onApply }: Props) {
  const [state, setState] = useState<ParseState>('idle')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ParsedSceneFields | null>(null)
  // Editable copy — user can modify before applying
  const [draft, setDraft] = useState<ParsedSceneFields>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setState('idle'); setFileName(''); setError(''); setPreview(null); setDraft({})
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setState('parsing')
    setPreview(null)
    setDraft({})
    setError('')
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    try {
      const text = await file.text()
      let parsed: ParsedSceneFields = {}

      if (ext === 'fdx') {
        parsed = parseFdxText(text, file.name)
      } else if (ext === 'fountain') {
        parsed = parseFountainText(text, file.name)
      } else {
        // .txt / .md — try fountain first, then keyword matcher, combine both
        const fountain = parseFountainText(text, file.name)
        const kw = parseKeywords(text)
        parsed = merge(fountain, kw)
      }

      if (countFields(parsed) >= 2) {
        setPreview(parsed)
        setDraft(parsed)
        setState('preview')
      } else {
        // Fall back to Claude (storyboard-parse module)
        const apiResult = await parseViaApi(text)
        const combined = merge(parsed, apiResult)
        setPreview(combined)
        setDraft(combined)
        setState('preview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed')
      setState('error')
    }
  }

  const setField = (key: keyof ParsedSceneFields, val: string) =>
    setDraft(prev => ({ ...prev, [key]: val }))

  const apply = () => {
    const cleaned = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
    ) as ParsedSceneFields
    onApply(cleaned)
    reset()
  }

  const filledCount = countFields(draft)

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '6px',
      marginBottom: '0.75rem',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        background: 'var(--color-bg-card)',
        borderBottom: state !== 'idle' ? '1px solid var(--color-border-dim)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-dim)', fontWeight: 600 }}>
            ◈ Import Scene or Shot List
          </span>
          <span style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', opacity: 0.45, letterSpacing: '0.08em' }}>
            optional · .fountain .fdx .txt .md
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {state !== 'idle' && (
            <button onClick={reset} style={{ fontSize: '0.62rem', color: 'var(--color-text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>
              ✕ clear
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".fountain,.fdx,.txt,.md"
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

      {/* ── Parsing ── */}
      {state === 'parsing' && (
        <div style={{ padding: '0.6rem 1rem', background: 'var(--color-bg-input)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
          Reading <strong style={{ color: 'var(--color-text)', fontWeight: 500 }}>{fileName}</strong>
          <span style={{ color: 'var(--color-gold)', marginLeft: '0.35rem' }}>···</span>
        </div>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div style={{ padding: '0.6rem 1rem', background: 'var(--color-bg-input)', fontSize: '0.7rem', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* ── Editable preview ── */}
      {state === 'preview' && preview !== null && (
        <div style={{ padding: '0.9rem 1rem', background: 'var(--color-bg-input)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>
              {filledCount} field{filledCount !== 1 ? 's' : ''} extracted from {fileName}
            </span>
            <span style={{ fontSize: '0.58rem', color: 'var(--color-text-dim)', opacity: 0.55 }}>edit before applying</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.9rem' }}>
            {PREVIEW_FIELDS.map(({ key, label, multiline }) => {
              const val = draft[key] ?? ''
              // Show field if it has content, or if it's a key field (title, location, characters)
              const isKeyField = ['projectTitle', 'location', 'characterSlotA'].includes(key)
              if (!val && !isKeyField) return null

              return (
                <div key={key}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.6rem',
                    color: 'var(--color-text-dim)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.18rem',
                  }}>
                    {label}
                  </label>
                  {multiline ? (
                    <textarea
                      value={val}
                      onChange={(e) => setField(key, e.target.value)}
                      rows={2}
                      style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.45 }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setField(key, e.target.value)}
                      style={INPUT_STYLE}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {filledCount === 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem' }}>
              No recognizable fields found. Try a different file or paste the text into the screenplay field below.
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={apply}
              disabled={filledCount === 0}
              style={{
                padding: '0.38rem 0.85rem',
                background: filledCount === 0 ? 'var(--color-bg-card)' : 'var(--color-gold)',
                border: 'none', borderRadius: '3px',
                color: filledCount === 0 ? 'var(--color-text-dim)' : '#0a0a0a',
                fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: filledCount === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              ◈ APPLY TO STORYBOARD
            </button>
            <button
              onClick={reset}
              style={{
                padding: '0.38rem 0.85rem',
                background: 'transparent',
                border: '1px solid var(--color-border)', borderRadius: '3px',
                color: 'var(--color-text-dim)', fontSize: '0.68rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
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
