// Shared domain types for Wards & Boards.

// ---------- Forge gate (board lint) ----------

/** A published board-style question (shape of questions.board.json entries). */
export interface BoardQuestion {
  caseId: string
  caseTitle: string
  system: string
  topic: string
  origQuestionId: string
  vignette: string
  leadIn: string
  options: string[]
  answerIndex: number
  explanation: string
}

/**
 * The minimal structural shape the Forge gate (boardLint) inspects.
 * BoardQuestion satisfies this, and so do in-progress drafts in the
 * authoring flow, which is why the lint accepts the looser shape.
 */
export interface LintInput {
  vignette?: string
  leadIn?: string
  options?: string[]
  answerIndex?: number
}

/** Result of running an item through the Forge gate. */
export interface LintResult {
  ok: boolean
  fails: string[]
}

// ---------- Learn content (cases) ----------

export interface Rubric {
  concept: string
  keywords: string[]
}

export interface WardPrompt {
  id: string
  question: string
  hint?: string
  rubric: Rubric[]
}

export interface WardMomentData {
  rotation: string
  scenario: string
  why: string
  modelAnswer?: string
  prompts: WardPrompt[]
}

export interface CurvePath {
  d: string
  label: string
  lx: number
  ly: number
  muted: boolean
}

export interface GraphicConfig {
  title: string
  xLabel: string
  yLabel: string
  paths: CurvePath[]
}

/** Props the StarlingCurve accepts; case data spreads partials of this. */
export interface StarlingProps {
  compact?: boolean
  phase?: string
  curves?: string
  point?: [number, number] | null
  config?: GraphicConfig | null
}

export interface MS1Question {
  id: string
  stem: string
  choices: string[]
  correct: number
  feedback: string
  curve?: { pre: StarlingProps; post: StarlingProps }
  placeholder?: boolean
  topic?: string
}

export interface MS1 {
  intro?: string
  questions: MS1Question[]
}

export interface ChainStep {
  label: string
  detail: string
  pt?: [number, number]
}

export interface Mechanism {
  quickFlow?: string[]
  quickPts?: [number, number][]
  chain: ChainStep[]
  graphic?: GraphicConfig
  starlingText?: string
  summaryLabel?: string
  clinicalPearl?: string
  source?: string
}

export interface Case {
  id: string
  active?: boolean
  title: string
  system: string
  topic: string
  wardMoment: WardMomentData
  vignette: string
  video?: string | null
  ms1: MS1
  mechanism: Mechanism
}

// ---------- Anki / learning points ----------

export interface LearningPoint {
  front: string
  back: string
}

// ---------- Practice (runtime question items) ----------

export interface PracticeItem {
  id: string
  caseId: string | null
  qkey: string
  caseTitle: string
  system: string
  topic: string
  vignette: string
  leadIn: string
  options: string[]
  answerIndex: number
  explanation: string
  source: string
  citableId?: string | null
  lint: LintResult
  // Set for DB-published community questions: the real author + reviewer credits.
  // When absent, the byline falls back to the deterministic mock attribution.
  attribution?: Attribution
  // Optional YouTube explainer link (as pasted); embedded when present.
  video?: string | null
  // Set on questions a course instructor assigned (source 'Assigned'): the
  // instructor's name, used for an honest byline (these are NOT peer-reviewed).
  assignedBy?: string
}

export interface PracticeAttempt {
  correct: boolean
}

export interface PracticeStore {
  att: Record<string, PracticeAttempt[]>
  rate: Record<string, number>
}

// ---------- Authors / credit layer ----------

export interface Author {
  id: string
  name: string
  creds: string
  role: string
  institution: string
  color: string
  initials: string
  photo: string | null
  followers: number
  orcid: string
  published: number
  reviews: number
  stars: number
  joined: string
  badges: [string, string][]
  bio: string
  qs: [string, string, number, string][]
}

export interface Attribution {
  author: Author
  reviewers: Author[]
}

// ---------- Accounts (mock auth) ----------

export interface UserApp {
  status: string
  training?: string
  institution?: string
  npi?: string
}

export interface User {
  name: string
  email: string
  role: string
  app: UserApp
}

export interface AuthState {
  currentEmail: string | null
  users: Record<string, User>
}

/** A pending contributor application, normalized for the admin queue (DB or mock). */
export interface PendingApp {
  id: string // profile id (DB) or email (mock) — what onDecide receives
  name: string
  email: string
  training: string
  institution: string
  npi: string
}

// ---------- Contribute ----------

export interface Draft {
  level: string
  system: string
  vignette: string
  leadIn: string
  options: string[]
  answerIndex: number
  explanation: string
  video: string
}

export interface ContribReview {
  reviewerId: string
  decision: string
}

export interface ContribQuestion extends Draft {
  id: string
  citableId: string | null
  status: string
  caseId: string | null
  caseTitle: string | null
  authorId: string
  reviews: ContribReview[]
}

export interface ContribState {
  qs: ContribQuestion[]
  counter: number
}
