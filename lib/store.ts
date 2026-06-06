'use client'
import { create } from 'zustand'
import type {
  CharacterData,
  CharacterSheetData,
  StoryboardData,
  VideoData,
  LogoData,
} from './types'

interface ILIADStore {
  activeModule: number
  characterData: CharacterData
  characterSheetData: CharacterSheetData
  storyboardData: StoryboardData
  videoData: VideoData
  logoData: LogoData
  setActiveModule: (m: number) => void
  updateCharacterData: (d: Partial<CharacterData>) => void
  updateCharacterSheetData: (d: Partial<CharacterSheetData>) => void
  updateStoryboardData: (d: Partial<StoryboardData>) => void
  updateVideoData: (d: Partial<VideoData>) => void
  updateLogoData: (d: Partial<LogoData>) => void
}

const defaultPanelCount = 10

export const useStore = create<ILIADStore>((set) => ({
  activeModule: 0,

  characterData: {
    subjectDescription: '',
    visualStyle: 'photorealistic',
    wardrobe: '',
    mood: '',
    setting: '',
    technicalStyle: 'kodak-portra',
    generatedPrompt: '',
  },

  characterSheetData: {
    characterName: '',
    role: '',
    coreMood: '',
    visualSignature: '',
    style: 'identity-board',
    characterRef: null,
    generatedPrompt: '',
  },

  storyboardData: {
    projectTitle: '',
    metaLine: '',
    microBrief: '',
    genreTone: '',
    panelCount: defaultPanelCount,
    gridLayout: '',
    storyboardFormat: 'director-strip',
    characterSlotA: '',
    characterSlotB: '',
    environmentReference: '',
    scenePremise: '',
    location: '',
    startToEnd: '',
    actionChain: '',
    mustRead: '',
    emotionalArc: '',
    styleLocks: '',
    effectLocks: '',
    environmentLocks: '',
    spatialContinuityLock: '',
    panelHeaders: Array(defaultPanelCount).fill(''),
    rhythmTrack: '',
    escalationMap: '',
    characterRefA: null,
    characterRefB: null,
    environmentImageRef: null,
    screenplayInput: '',
    generatedPrompt: '',
  },

  videoData: {
    emotionalGuidance: '',
    audioNotes: '',
    styleDescription: '',
    promptStyle: 'full-panel-beats',
    specialMode: 'none',
    storyboardImageRef: null,
    characterImageRef: null,
    generatedPrompt: '',
  },

  logoData: {
    logoDescription: '',
    environments: Array(10).fill(''),
    logoImageRef: null,
    generatedPrompt: '',
  },

  setActiveModule: (m) => set({ activeModule: m }),
  updateCharacterData: (d) =>
    set((s) => ({ characterData: { ...s.characterData, ...d } })),
  updateCharacterSheetData: (d) =>
    set((s) => ({ characterSheetData: { ...s.characterSheetData, ...d } })),
  updateStoryboardData: (d) =>
    set((s) => ({ storyboardData: { ...s.storyboardData, ...d } })),
  updateVideoData: (d) =>
    set((s) => ({ videoData: { ...s.videoData, ...d } })),
  updateLogoData: (d) =>
    set((s) => ({ logoData: { ...s.logoData, ...d } })),
}))
