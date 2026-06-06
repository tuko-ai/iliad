'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormField, Input, Textarea, Select, RadioGroup } from '@/components/FormField'
import { PromptResult } from '@/components/PromptResult'
import { ImageUpload } from '@/components/ImageUpload'
import { SceneImport } from '@/components/SceneImport'
import type { StoryboardFormat, StoryboardData } from '@/lib/types'

const PANEL_COUNTS = [
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '20', label: '20' },
  { value: '24', label: '24' },
]

const FORMATS: { value: StoryboardFormat; label: string }[] = [
  { value: 'director-strip', label: 'Director Strip' },
  { value: 'color-annotated', label: 'Color Annotated' },
  { value: 'action-previs', label: 'Action Previs' },
]

export default function StoryboardBuilder() {
  const { characterData, characterSheetData, storyboardData, updateStoryboardData } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [localPrompt, setLocalPrompt] = useState(storyboardData.generatedPrompt)
  const [showScreenplay, setShowScreenplay] = useState(false)

  const set = (field: string, value: unknown) =>
    updateStoryboardData({ [field]: value } as never)

  const hasCharacterA = !!characterData.subjectDescription
  const hasCharacterName = !!characterSheetData.characterName

  const autoFillCharacters = () => {
    const updates: Partial<StoryboardData> = {}

    // Build character slot A — include visual appearance for storyboard consistency
    if (hasCharacterName) {
      const visual = characterSheetData.visualSignature || characterData.subjectDescription
      const mood = characterSheetData.coreMood || characterData.mood
      updates.characterSlotA = [characterSheetData.characterName, visual, mood].filter(Boolean).join(' — ')
    } else if (hasCharacterA) {
      updates.characterSlotA = [characterData.subjectDescription.slice(0, 100), characterData.mood].filter(Boolean).join(' — ')
    }

    // Populate style locks from technical style if not already set
    if (!storyboardData.styleLocks && characterData.technicalStyle) {
      const styleMap: Record<string, string> = {
        'kodak-portra': 'Kodak Portra 800, film grain, natural color palette',
        'anime': 'Anime style, clean linework, cel-look lighting',
        'cel': 'Cel-shaded, flat color fills, strong outlines',
      }
      updates.styleLocks = styleMap[characterData.technicalStyle] ?? characterData.technicalStyle
    }

    // Populate environment from character setting if not already set
    if (!storyboardData.environmentReference && characterData.setting) {
      updates.environmentReference = characterData.setting
    }

    updateStoryboardData(updates)
  }

  const handlePanelCountChange = (v: string) => {
    const count = parseInt(v) as 10 | 12 | 14 | 16 | 20 | 24
    const current = storyboardData.panelHeaders
    const adjusted = Array(count).fill('').map((_, i) => current[i] || '')
    updateStoryboardData({ panelCount: count, panelHeaders: adjusted })
  }

  const parseScreenplay = async () => {
    if (!storyboardData.screenplayInput.trim()) return
    setIsParsing(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'storyboard-parse', screenplayInput: storyboardData.screenplayInput }),
      })
      const json = await res.json()
      if (json && typeof json === 'object') {
        updateStoryboardData(json)
      }
    } catch {
      // fail silently — user keeps their fields
    } finally {
      setIsParsing(false)
    }
  }

  const generate = async () => {
    if (!storyboardData.projectTitle.trim()) return
    setIsGenerating(true)
    setLocalPrompt('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'storyboard', ...storyboardData }),
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
      updateStoryboardData({ generatedPrompt: full })
    } catch (err) {
      setLocalPrompt('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="module-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        <SceneImport onApply={(fields) => updateStoryboardData(fields as never)} />

        {/* Screenplay paste import */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showScreenplay ? '0.75rem' : 0 }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Paste Screenplay / Shot List
            </span>
            <button
              onClick={() => setShowScreenplay(!showScreenplay)}
              style={{ fontSize: '0.72rem', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showScreenplay ? '▲ COLLAPSE' : '▼ EXPAND'}
            </button>
          </div>
          {showScreenplay && (
            <>
              <Textarea
                placeholder="Paste screenplay scene or shot list here..."
                rows={6}
                value={storyboardData.screenplayInput}
                onChange={(e) => set('screenplayInput', e.target.value)}
              />
              <button
                onClick={parseScreenplay}
                disabled={isParsing || !storyboardData.screenplayInput.trim()}
                style={{
                  marginTop: '0.6rem',
                  width: '100%',
                  padding: '0.6rem',
                  background: 'var(--color-bg-input)',
                  border: '1px solid var(--color-gold-dim)',
                  borderRadius: '4px',
                  color: 'var(--color-gold)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  opacity: !storyboardData.screenplayInput.trim() ? 0.4 : 1,
                }}
              >
                {isParsing ? '● PARSING...' : '⇑ AUTO-POPULATE FIELDS'}
              </button>
            </>
          )}
        </div>

        {/* Main form */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '1.25rem',
          }}
        >
          <SectionLabel>Project Identity</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Project Title" required>
              <Input
                placeholder="NEON REQUIEM"
                value={storyboardData.projectTitle}
                onChange={(e) => set('projectTitle', e.target.value)}
              />
            </FormField>
            <FormField label="Genre / Tone">
              <Input
                placeholder="Neo-noir thriller, oppressive dread"
                value={storyboardData.genreTone}
                onChange={(e) => set('genreTone', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Meta Line" hint="One-sentence film thesis or logline">
            <Input
              placeholder="A ghost detective confronts the city that murdered her conscience."
              value={storyboardData.metaLine}
              onChange={(e) => set('metaLine', e.target.value)}
            />
          </FormField>

          <FormField label="Micro Brief" hint="Scene context in 2–3 sentences">
            <Textarea
              rows={2}
              placeholder="Opening sequence. Kira arrives at the crime scene..."
              value={storyboardData.microBrief}
              onChange={(e) => set('microBrief', e.target.value)}
            />
          </FormField>

          <div className="section-divider" />
          <SectionLabel>Layout & Format</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Panel Count">
              <Select
                options={PANEL_COUNTS}
                value={String(storyboardData.panelCount)}
                onChange={(e) => handlePanelCountChange(e.target.value)}
              />
            </FormField>
            <FormField label="Grid Layout">
              <Input
                placeholder="3×4, 2×5, 4×3..."
                value={storyboardData.gridLayout}
                onChange={(e) => set('gridLayout', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Storyboard Format">
            <RadioGroup
              name="sbFormat"
              value={storyboardData.storyboardFormat}
              options={FORMATS}
              onChange={(v) => set('storyboardFormat', v)}
            />
          </FormField>

          <div className="section-divider" />
          <SectionLabel>Characters & Environment</SectionLabel>

          {(hasCharacterA || hasCharacterName) && (
            <button
              onClick={autoFillCharacters}
              style={{
                marginBottom: '0.75rem',
                padding: '0.35rem 0.75rem',
                background: 'var(--color-gold-muted)',
                border: '1px solid var(--color-gold-dim)',
                borderRadius: '3px',
                color: 'var(--color-gold)',
                fontWeight: 600,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              AUTO-FILL FROM MODULE 01/02 ↓
            </button>
          )}

          <FormField label="Character Slot A" required>
            <Input
              placeholder="Kira Voss — silver undercut, tactical jacket, silver eye"
              value={storyboardData.characterSlotA}
              onChange={(e) => set('characterSlotA', e.target.value)}
            />
          </FormField>
          <FormField label="Character Slot B (optional)">
            <Input
              placeholder="Marcus — heavy coat, prosthetic left hand, no eye contact"
              value={storyboardData.characterSlotB}
              onChange={(e) => set('characterSlotB', e.target.value)}
            />
          </FormField>
          <FormField label="Environment Description (optional)">
            <Input
              placeholder="Industrial waterfront, 2 AM, heavy rain, sodium vapor lights"
              value={storyboardData.environmentReference}
              onChange={(e) => set('environmentReference', e.target.value)}
            />
          </FormField>

          <div className="section-divider" />
          <SectionLabel>Reference Images</SectionLabel>

          <ImageUpload
            label="Character A Reference"
            hint="Upload a character image — Claude analyzes their design and incorporates it"
            refTag="@[character A]"
            value={storyboardData.characterRefA}
            onChange={(ref) => updateStoryboardData({ characterRefA: ref })}
            required
          />
          <ImageUpload
            label="Character B Reference"
            refTag="@[character B]"
            value={storyboardData.characterRefB}
            onChange={(ref) => updateStoryboardData({ characterRefB: ref })}
          />
          <ImageUpload
            label="Environment Reference"
            hint="Upload an environment/location image — Claude analyzes the space and lighting"
            refTag="@[environment ref]"
            value={storyboardData.environmentImageRef}
            onChange={(ref) => updateStoryboardData({ environmentImageRef: ref })}
          />

          <div className="section-divider" />
          <SectionLabel>Scene & Action</SectionLabel>

          <FormField label="Scene Premise">
            <Textarea
              rows={2}
              placeholder="Kira discovers the body. She recognizes the victim."
              value={storyboardData.scenePremise}
              onChange={(e) => set('scenePremise', e.target.value)}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormField label="Location">
              <Input
                placeholder="Pier 17, waterfront district"
                value={storyboardData.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </FormField>
            <FormField label="Start → End">
              <Input
                placeholder="Kira approaches → breaks down crying"
                value={storyboardData.startToEnd}
                onChange={(e) => set('startToEnd', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Action Chain" hint="Beat-by-beat action sequence">
            <Textarea
              rows={3}
              placeholder="She parks. Exits car in rain. Ducks under police tape. Crouches beside body. Removes glove. Touches hand. Recognizes ring."
              value={storyboardData.actionChain}
              onChange={(e) => set('actionChain', e.target.value)}
            />
          </FormField>

          <FormField label="Must Read" hint="Visual information the viewer MUST perceive">
            <Input
              placeholder="The ring. Her face changing. The rain."
              value={storyboardData.mustRead}
              onChange={(e) => set('mustRead', e.target.value)}
            />
          </FormField>

          <FormField label="Emotional Arc">
            <Input
              placeholder="Detachment → recognition → grief → controlled rage"
              value={storyboardData.emotionalArc}
              onChange={(e) => set('emotionalArc', e.target.value)}
            />
          </FormField>

          <div className="section-divider" />
          <SectionLabel>Style & Technical Locks</SectionLabel>

          <FormField label="Style Locks" hint="Visual style constraints applied to all panels">
            <Input
              placeholder="Kodak Portra 800, anamorphic lens flare, desaturated with amber push"
              value={storyboardData.styleLocks}
              onChange={(e) => set('styleLocks', e.target.value)}
            />
          </FormField>
          <FormField label="Effect Locks">
            <Input
              placeholder="Practical rain, no CG weather, lens moisture drops"
              value={storyboardData.effectLocks}
              onChange={(e) => set('effectLocks', e.target.value)}
            />
          </FormField>
          <FormField label="Environment Locks">
            <Input
              placeholder="Night only, no daylight, consistent sodium vapor color temp"
              value={storyboardData.environmentLocks}
              onChange={(e) => set('environmentLocks', e.target.value)}
            />
          </FormField>
          <FormField label="Spatial Continuity Lock">
            <Input
              placeholder="Eyeline match maintained, camera stays west side of pier throughout"
              value={storyboardData.spatialContinuityLock}
              onChange={(e) => set('spatialContinuityLock', e.target.value)}
            />
          </FormField>

          <div className="section-divider" />
          <SectionLabel>Panel Headers ({storyboardData.panelCount} panels)</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {Array.from({ length: storyboardData.panelCount }).map((_, i) => (
              <div key={i}>
                <label style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                  Panel {i + 1}
                </label>
                <Input
                  placeholder={`P${i + 1} header...`}
                  value={storyboardData.panelHeaders[i] || ''}
                  onChange={(e) => {
                    const updated = [...storyboardData.panelHeaders]
                    updated[i] = e.target.value
                    set('panelHeaders', updated)
                  }}
                  style={{ fontSize: '0.78rem' }}
                />
              </div>
            ))}
          </div>

          <div className="section-divider" />
          <SectionLabel>Rhythm & Pacing</SectionLabel>

          <FormField
            label="Rhythm Track"
            hint="Kōda format: RHY P##: [tempo] / [block] / [beat-feel] — leave blank to auto-generate"
          >
            <Textarea
              rows={3}
              placeholder={`RHY P01: hold / long block / held beat
RHY P02: slow reveal / medium block / clean beat
RHY P03: build / medium block / match beat
RHY P04: burst / short block / smash beat`}
              value={storyboardData.rhythmTrack}
              onChange={(e) => set('rhythmTrack', e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </FormField>
          <div
            style={{
              marginTop: '-0.5rem',
              marginBottom: '0.25rem',
              padding: '0.45rem 0.65rem',
              background: 'rgba(201, 162, 39, 0.06)',
              border: '1px solid rgba(201, 162, 39, 0.15)',
              borderRadius: '3px',
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--color-gold)', opacity: 0.8 }}>tempo:</strong>{' '}
            hold · slow reveal · build · burst · impact · pause · recover · final hit
            {'  '}
            <strong style={{ color: 'var(--color-gold)', opacity: 0.8 }}>block:</strong>{' '}
            short · medium · long
            {'  '}
            <strong style={{ color: 'var(--color-gold)', opacity: 0.8 }}>beat-feel:</strong>{' '}
            clean · match · smash · held · whip
          </div>

          <FormField
            label="Escalation Map"
            hint="Kōda format: ESC P##: L# / [curve] — leave blank to auto-generate"
          >
            <Textarea
              rows={3}
              placeholder={`ESC P01: L1 calm / flat
ESC P02: L2 tension / rise
ESC P03: L3 rise / rise
ESC P04: L4 surge / spike`}
              value={storyboardData.escalationMap}
              onChange={(e) => set('escalationMap', e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            />
          </FormField>
          <div
            style={{
              marginTop: '-0.5rem',
              marginBottom: '0.25rem',
              padding: '0.45rem 0.65rem',
              background: 'rgba(201, 162, 39, 0.06)',
              border: '1px solid rgba(201, 162, 39, 0.15)',
              borderRadius: '3px',
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--color-gold)', opacity: 0.8 }}>L#:</strong>{' '}
            L1 calm · L2 tension · L3 rise · L4 surge · L5 peak
            {'  '}
            <strong style={{ color: 'var(--color-gold)', opacity: 0.8 }}>curve:</strong>{' '}
            flat · rise · spike · drop · release · unresolved
          </div>

          <button
            onClick={generate}
            disabled={isGenerating || !storyboardData.projectTitle.trim()}
            style={{
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: isGenerating ? 'var(--color-bg-input)' : 'var(--color-gold)',
              border: 'none',
              borderRadius: '4px',
              color: isGenerating ? 'var(--color-gold)' : '#0a0a0a',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: isGenerating || !storyboardData.projectTitle.trim() ? 'not-allowed' : 'pointer',
              opacity: !storyboardData.projectTitle.trim() ? 0.4 : 1,
              transition: 'all 0.15s',
            }}
          >
            {isGenerating ? '● GENERATING...' : '◈ GENERATE STORYBOARD PROMPT'}
          </button>
        </div>
      </div>

      {/* Result */}
      <PromptResult
        prompt={localPrompt}
        isGenerating={isGenerating}
        moduleName="Storyboard Builder"
        targetTool="GPT IMAGE 2"
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
