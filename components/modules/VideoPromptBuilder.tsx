'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormField, Textarea, RadioGroup } from '@/components/FormField'
import { PromptResult } from '@/components/PromptResult'
import { ImageUpload } from '@/components/ImageUpload'
import type { PromptStyle, SpecialMode } from '@/lib/types'

const PROMPT_STYLES: { value: PromptStyle; label: string }[] = [
  { value: 'full-panel-beats', label: 'Full Panel Beats' },
  { value: 'numbered-shots', label: 'Numbered Shots' },
  { value: 'minimal', label: 'Minimal' },
]

const SPECIAL_MODES: { value: SpecialMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'loop', label: 'Loop' },
  { value: 'one-shot-continuous', label: 'One-Shot Continuous' },
  { value: 'staccato-inserts', label: 'Staccato Inserts' },
  { value: 'logo-animation', label: 'Logo Animation' },
]

export default function VideoPromptBuilder() {
  const { storyboardData, videoData, updateVideoData } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [localPrompt, setLocalPrompt] = useState(videoData.generatedPrompt)
  const hasStoryboard = !!storyboardData.projectTitle

  const set = (field: string, value: string) =>
    updateVideoData({ [field]: value } as never)

  const autoFillFromStoryboard = () => {
    if (!videoData.styleDescription && storyboardData.styleLocks) {
      updateVideoData({ styleDescription: storyboardData.styleLocks })
    }
    if (!videoData.emotionalGuidance && storyboardData.emotionalArc) {
      updateVideoData({ emotionalGuidance: storyboardData.emotionalArc })
    }
  }

  const buildStoryboardContext = () => {
    if (!hasStoryboard) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    const headerList = storyboardData.panelHeaders
      .map((h, i) => `P${pad(i + 1)}: ${h || '(auto)'}`)
      .join(' | ')
    return [
      `Project: ${storyboardData.projectTitle}`,
      `Genre/Tone: ${storyboardData.genreTone}`,
      `Panels: ${storyboardData.panelCount} (${storyboardData.gridLayout || 'auto'})`,
      `Format: ${storyboardData.storyboardFormat}`,
      `Scene: ${storyboardData.scenePremise}`,
      `Location: ${storyboardData.location}`,
      `Action Chain: ${storyboardData.actionChain}`,
      `Emotional Arc: ${storyboardData.emotionalArc}`,
      `Style Locks: ${storyboardData.styleLocks}`,
      `Rhythm Track: ${storyboardData.rhythmTrack}`,
      `Escalation Map: ${storyboardData.escalationMap}`,
      storyboardData.characterSlotA && `C1: ${storyboardData.characterSlotA}`,
      storyboardData.characterSlotB && `C2: ${storyboardData.characterSlotB}`,
      `Panel Headers: ${headerList}`,
    ].filter(Boolean).join('\n')
  }

  const generate = async () => {
    setIsGenerating(true)
    setLocalPrompt('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'video',
          ...videoData,
          storyboardContext: buildStoryboardContext(),
        }),
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
      updateVideoData({ generatedPrompt: full })
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
        {/* Storyboard context indicator */}
        {hasStoryboard ? (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              background: 'var(--color-gold-muted)',
              border: '1px solid var(--color-gold-dim)',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--color-gold)' }}>
              ◈ Auto-assembling from Module 03: <strong>{storyboardData.projectTitle}</strong>
              {' '}({storyboardData.panelCount} panels)
            </span>
            <button
              onClick={autoFillFromStoryboard}
              style={{
                padding: '0.25rem 0.6rem',
                background: 'var(--color-gold)',
                border: 'none',
                borderRadius: '3px',
                color: '#0a0a0a',
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              AUTO-FILL ↓
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '0.6rem 0.85rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
            }}
          >
            No storyboard loaded — you can generate standalone or fill Module 03 first
          </div>
        )}

        <SectionLabel>Reference Images</SectionLabel>

        <ImageUpload
          label="Storyboard Reference"
          hint="Upload your generated storyboard — Claude reads the panel flow and shot composition"
          refTag="@[storyboard ref]"
          value={videoData.storyboardImageRef}
          onChange={(ref) => updateVideoData({ storyboardImageRef: ref })}
          required
        />
        <ImageUpload
          label="Character Reference"
          hint="Upload a character image — Claude incorporates their visual presence into the video prompt"
          refTag="@[character ref]"
          value={videoData.characterImageRef}
          onChange={(ref) => updateVideoData({ characterImageRef: ref })}
          required
        />

        <div className="section-divider" />
        <SectionLabel>Output Configuration</SectionLabel>

        <FormField label="Prompt Style">
          <RadioGroup
            name="promptStyle"
            value={videoData.promptStyle}
            options={PROMPT_STYLES}
            onChange={(v) => set('promptStyle', v)}
          />
        </FormField>

        <FormField label="Special Mode">
          <RadioGroup
            name="specialMode"
            value={videoData.specialMode}
            options={SPECIAL_MODES}
            onChange={(v) => set('specialMode', v)}
          />
        </FormField>

        <div className="section-divider" />
        <SectionLabel>Refinement Layers</SectionLabel>

        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.55rem 0.75rem',
            background: 'rgba(201, 162, 39, 0.05)',
            border: '1px solid rgba(201, 162, 39, 0.2)',
            borderRadius: '4px',
            fontSize: '0.65rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: 'var(--color-gold)', opacity: 0.9, fontWeight: 600, letterSpacing: '0.08em' }}>
            STORYDANCE FORMAT
          </span>
          {'  '}Blueprint → Character Ref → ENVIRONMENT → EMOTIONAL GUIDANCE → VISUAL STYLE → AUDIO → PANEL BEATS
        </div>

        <FormField
          label="Emotional Guidance"
          hint="Converted to Valence + Arousal labels automatically — describe feeling arc and pacing"
        >
          <Textarea
            rows={3}
            placeholder="Slow dread building to visceral shock. Hold on faces. Let silence breathe. Neutral-to-grief Valence, low-to-medium Arousal."
            value={videoData.emotionalGuidance}
            onChange={(e) => set('emotionalGuidance', e.target.value)}
          />
        </FormField>

        <FormField
          label="Audio Notes"
          hint="Diegetic ambience, foley, impacts, SFX — no score unless specified"
        >
          <Textarea
            rows={2}
            placeholder="Low cello drone (diegetic), distant rain, footsteps on wet concrete, ambient industrial hum"
            value={videoData.audioNotes}
            onChange={(e) => set('audioNotes', e.target.value)}
          />
        </FormField>

        <FormField label="Style Description" hint="Cinematography, color, lens, final look">
          <Textarea
            rows={2}
            placeholder="Anamorphic 2.39:1, Kodak 5213, shallow depth of field, amber-green color grade"
            value={videoData.styleDescription}
            onChange={(e) => set('styleDescription', e.target.value)}
          />
        </FormField>

        <button
          onClick={generate}
          disabled={isGenerating}
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
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isGenerating ? '● GENERATING...' : '◈ GENERATE VIDEO PROMPT'}
        </button>
      </div>

      {/* Result */}
      <PromptResult
        prompt={localPrompt}
        isGenerating={isGenerating}
        moduleName="Video Prompt Builder"
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
