'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { FormField, Input, Textarea, RadioGroup } from '@/components/FormField'
import { PromptResult } from '@/components/PromptResult'
import { ImageUpload } from '@/components/ImageUpload'
import { CharacterBibleImport, type ParsedFields as BibleFields } from '@/components/CharacterBibleImport'
import type { SheetStyle } from '@/lib/types'

const SHEET_STYLES: { value: SheetStyle; label: string }[] = [
  { value: 'identity-board', label: 'Identity Board' },
  { value: 'artbook', label: 'Artbook' },
  { value: 'turnaround', label: 'Turnaround' },
]

export default function CharacterSheetBuilder() {
  const { characterData, characterSheetData, updateCharacterSheetData } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [localPrompt, setLocalPrompt] = useState(characterSheetData.generatedPrompt)
  const hasCharacterData = !!characterData.subjectDescription

  const set = (field: string, value: string) =>
    updateCharacterSheetData({ [field]: value } as never)

  const autoFill = () => {
    const visualParts = [
      characterData.subjectDescription,
      characterData.wardrobe,
      characterData.setting,
    ].filter(Boolean)

    updateCharacterSheetData({
      coreMood: characterData.mood || characterSheetData.coreMood,
      visualSignature: visualParts.length > 0
        ? visualParts.join('. ')
        : characterSheetData.visualSignature,
    })
  }

  const handleBibleApply = (fields: BibleFields) => {
    const visualParts = [fields.subjectDescription, fields.wardrobe, fields.setting].filter(Boolean)
    updateCharacterSheetData({
      ...(fields.characterName ? { characterName: fields.characterName } : {}),
      ...(fields.role ? { role: fields.role } : {}),
      ...(fields.mood ? { coreMood: fields.mood } : {}),
      ...(visualParts.length > 0 ? { visualSignature: visualParts.join('. ') } : {}),
    })
  }

  const generate = async () => {
    if (!characterSheetData.characterName.trim()) return
    setIsGenerating(true)
    setLocalPrompt('')
    const context = hasCharacterData
      ? `Subject: ${characterData.subjectDescription}. Visual style: ${characterData.visualStyle}. Technical: ${characterData.technicalStyle}.`
      : ''
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'character-sheet',
          ...characterSheetData,
          characterContext: context,
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
      updateCharacterSheetData({ generatedPrompt: full })
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
        <CharacterBibleImport onApply={handleBibleApply} />

        {/* Auto-fill banner */}
        {hasCharacterData && (
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
              Character data available from Module 01
            </span>
            <button
              onClick={autoFill}
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
        )}

        <FormField label="Character Name" required>
          <Input
            placeholder="Kira Voss"
            value={characterSheetData.characterName}
            onChange={(e) => set('characterName', e.target.value)}
          />
        </FormField>

        <FormField label="Role">
          <Input
            placeholder="Protagonist · Field Operative · Anti-hero"
            value={characterSheetData.role}
            onChange={(e) => set('role', e.target.value)}
          />
        </FormField>

        <FormField label="Core Mood">
          <Input
            placeholder="Calculating, world-weary, darkly compassionate"
            value={characterSheetData.coreMood}
            onChange={(e) => set('coreMood', e.target.value)}
          />
        </FormField>

        <FormField
          label="Visual Signature"
          hint="Defining visual traits, silhouette markers, key wardrobe, color palette"
        >
          <Textarea
            placeholder="Silver undercut, tactical jacket always unbuttoned, never without the red thread bracelet..."
            rows={3}
            value={characterSheetData.visualSignature}
            onChange={(e) => set('visualSignature', e.target.value)}
          />
        </FormField>

        <FormField label="Sheet Style">
          <RadioGroup
            name="sheetStyle"
            value={characterSheetData.style}
            options={SHEET_STYLES}
            onChange={(v) => set('style', v)}
          />
        </FormField>

        <div className="section-divider" />
        <SectionLabel>Reference Image</SectionLabel>

        <ImageUpload
          label="Character Reference"
          hint="Upload a character image — Claude will analyze the visual design and incorporate it into the prompt"
          refTag="@[character ref]"
          value={characterSheetData.characterRef}
          onChange={(ref) => updateCharacterSheetData({ characterRef: ref })}
        />

        <button
          onClick={generate}
          disabled={isGenerating || !characterSheetData.characterName.trim()}
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
            cursor: isGenerating || !characterSheetData.characterName.trim() ? 'not-allowed' : 'pointer',
            opacity: !characterSheetData.characterName.trim() ? 0.4 : 1,
            transition: 'all 0.15s',
          }}
        >
          {isGenerating ? '● GENERATING...' : '◈ GENERATE SHEET PROMPT'}
        </button>
      </div>

      {/* Result */}
      <PromptResult
        prompt={localPrompt}
        isGenerating={isGenerating}
        moduleName="Character Sheet Builder"
        targetTool="GPT IMAGE 2"
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.65rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: 'var(--color-text-dim)',
      marginBottom: '0.85rem',
      paddingBottom: '0.4rem',
      borderBottom: '1px solid var(--color-border-dim)',
    }}>
      {children}
    </div>
  )
}
