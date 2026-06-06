'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormField, Input, Textarea, Select, RadioGroup } from '@/components/FormField'
import { PromptResult } from '@/components/PromptResult'
import { CharacterBibleImport } from '@/components/CharacterBibleImport'
import type { VisualStyle, TechnicalStyle } from '@/lib/types'

const VISUAL_STYLES: { value: VisualStyle; label: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'anime-painterly', label: 'Anime-Painterly' },
  { value: 'cel-shaded-3d', label: 'Cel-Shaded 3D' },
  { value: 'stylized-3d', label: 'Stylized 3D' },
]

const TECHNICAL_STYLES: { value: TechnicalStyle; label: string }[] = [
  { value: 'kodak-portra', label: 'Kodak Portra' },
  { value: 'anime', label: 'Anime' },
  { value: 'cel', label: 'Cel' },
]

export default function CharacterBuilder() {
  const { characterData, updateCharacterData } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [localPrompt, setLocalPrompt] = useState(characterData.generatedPrompt)

  const set = (field: string, value: string) =>
    updateCharacterData({ [field]: value } as never)

  const generate = async () => {
    if (!characterData.subjectDescription.trim()) return
    setIsGenerating(true)
    setLocalPrompt('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: 'character', ...characterData }),
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
      updateCharacterData({ generatedPrompt: full })
    } catch (err) {
      setLocalPrompt('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="module-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Form */}
      <div>
        <CharacterBibleImport onApply={(fields) => updateCharacterData(fields as never)} />

        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '1.5rem',
          }}
        >
        <SectionLabel>Character Description</SectionLabel>

        <FormField label="Subject Description" required>
          <Textarea
            placeholder="A 28-year-old woman with sharp Eurasian features, high cheekbones, short silver-dyed undercut..."
            rows={4}
            value={characterData.subjectDescription}
            onChange={(e) => set('subjectDescription', e.target.value)}
          />
        </FormField>

        <FormField label="Visual Style">
          <RadioGroup
            name="visualStyle"
            value={characterData.visualStyle}
            options={VISUAL_STYLES}
            onChange={(v) => set('visualStyle', v)}
          />
        </FormField>

        <div className="section-divider" />
        <SectionLabel>Wardrobe & Atmosphere</SectionLabel>

        <FormField label="Wardrobe">
          <Textarea
            placeholder="Oversized tactical jacket, distressed denim, matte black boots..."
            rows={2}
            value={characterData.wardrobe}
            onChange={(e) => set('wardrobe', e.target.value)}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <FormField label="Mood">
            <Input
              placeholder="Quiet defiance, exhausted resolve"
              value={characterData.mood}
              onChange={(e) => set('mood', e.target.value)}
            />
          </FormField>
          <FormField label="Setting">
            <Input
              placeholder="Rain-soaked neon alley, 2 AM"
              value={characterData.setting}
              onChange={(e) => set('setting', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Technical Style">
          <Select
            options={TECHNICAL_STYLES}
            value={characterData.technicalStyle}
            onChange={(e) => set('technicalStyle', e.target.value)}
          />
        </FormField>

        <button
          onClick={generate}
          disabled={isGenerating || !characterData.subjectDescription.trim()}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: isGenerating ? 'var(--color-bg-input)' : 'var(--color-gold)',
            border: 'none',
            borderRadius: '4px',
            color: isGenerating ? 'var(--color-gold)' : '#0a0a0a',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: isGenerating || !characterData.subjectDescription.trim() ? 'not-allowed' : 'pointer',
            opacity: !characterData.subjectDescription.trim() ? 0.4 : 1,
            transition: 'all 0.15s',
          }}
        >
          {isGenerating ? '● GENERATING...' : '◈ GENERATE CHARACTER PROMPT'}
        </button>
      </div>
      </div>

      {/* Result */}
      <PromptResult
        prompt={localPrompt}
        isGenerating={isGenerating}
        moduleName="Character Builder"
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
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--color-border-dim)',
      }}
    >
      {children}
    </div>
  )
}
