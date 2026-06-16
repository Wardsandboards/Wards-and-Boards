import type { GraphicConfig, Draft } from './types'

export const MODES = [
  { key: 'ms1', label: 'MS1', sub: 'Foundations', live: true },
  { key: 'ms2', label: 'MS2', sub: 'Integration', live: false },
  { key: 'ms3', label: 'MS3', sub: 'Clerkship', live: false },
  { key: 'ms4', label: 'MS4', sub: 'Boards', live: false },
]

export const CATEGORY_ORDER = ['Cardiology', 'Pulmonology', 'Hematology']

export function categoryOf(system: string): string {
  const s = (system || '').toLowerCase()
  if (s.includes('cardio')) return 'Cardiology'
  if (s.includes('hema')) return 'Hematology'
  if (s.includes('resp') || s.includes('pulmon') || s.includes('transport')) return 'Pulmonology'
  return 'Other'
}

export const TRAINING_LEVELS = ['Resident', 'Fellow', 'Attending', 'Other physician']
export const ADMIN_EMAILS = ['aaron@stanford.edu']

export const FLAG_REASONS = ['Wrong answer key', 'Typo or wording', 'Unclear question', 'Factual error', 'Other']

export const blankDraft: Draft = {
  level: 'step1',
  system: '',
  vignette: '',
  leadIn: '',
  options: ['', '', '', '', ''],
  answerIndex: 0,
  explanation: '',
}

export const DEFAULT_FS: GraphicConfig = {
  title: 'Frank-Starling curve',
  xLabel: 'End-diastolic volume (preload) →',
  yLabel: 'Stroke volume →',
  paths: [
    { d: 'M50,196 C 85,150 100,80 140,62 C 200,40 280,40 350,40', label: 'Normal contractility', lx: 250, ly: 34, muted: true },
    { d: 'M50,198 C 90,176 122,134 150,121 C 210,106 290,128 350,140', label: 'Heart failure', lx: 262, ly: 160, muted: false },
  ],
}
