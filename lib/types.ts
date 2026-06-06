export interface ImageRef {
  dataUrl: string
  name: string
}

export type VisualStyle = 'photorealistic' | 'anime-painterly' | 'cel-shaded-3d' | 'stylized-3d'
export type TechnicalStyle = 'kodak-portra' | 'anime' | 'cel'
export type SheetStyle = 'identity-board' | 'artbook' | 'turnaround'
export type StoryboardFormat = 'director-strip' | 'color-annotated' | 'action-previs'
export type PromptStyle = 'full-panel-beats' | 'numbered-shots' | 'minimal'
export type SpecialMode = 'none' | 'loop' | 'one-shot-continuous' | 'staccato-inserts' | 'logo-animation'

export interface CharacterData {
  subjectDescription: string
  visualStyle: VisualStyle
  wardrobe: string
  mood: string
  setting: string
  technicalStyle: TechnicalStyle
  generatedPrompt: string
}

export interface CharacterSheetData {
  characterName: string
  role: string
  coreMood: string
  visualSignature: string
  style: SheetStyle
  characterRef: ImageRef | null
  generatedPrompt: string
}

export interface StoryboardData {
  projectTitle: string
  metaLine: string
  microBrief: string
  genreTone: string
  panelCount: 10 | 12 | 14 | 16 | 20 | 24
  gridLayout: string
  storyboardFormat: StoryboardFormat
  characterSlotA: string
  characterSlotB: string
  environmentReference: string
  scenePremise: string
  location: string
  startToEnd: string
  actionChain: string
  mustRead: string
  emotionalArc: string
  styleLocks: string
  effectLocks: string
  environmentLocks: string
  spatialContinuityLock: string
  panelHeaders: string[]
  rhythmTrack: string
  escalationMap: string
  characterRefA: ImageRef | null
  characterRefB: ImageRef | null
  environmentImageRef: ImageRef | null
  screenplayInput: string
  generatedPrompt: string
}

export interface VideoData {
  emotionalGuidance: string
  audioNotes: string
  styleDescription: string
  promptStyle: PromptStyle
  specialMode: SpecialMode
  storyboardImageRef: ImageRef | null
  characterImageRef: ImageRef | null
  generatedPrompt: string
}

export interface LogoData {
  logoDescription: string
  environments: string[]
  logoImageRef: ImageRef | null
  generatedPrompt: string
}
