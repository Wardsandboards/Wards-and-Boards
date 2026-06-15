import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './styles.css'
import { CASES } from './data/cases'
import { DEMO_USERS } from './data/users'
import { ADMIN_EMAILS, CATEGORY_ORDER, blankDraft, categoryOf } from './constants'
import { boardLint } from './lib/boardLint'
import { boardBankFromJson, communityAttribution } from './lib/questions'
import { applyReview, enqueueDraft } from './lib/contribute'
import { loadLS, saveLS } from './lib/storage'
import { dbEnabled, loadStudyData, recordAttempt, saveCaseProgress, saveRating } from './lib/db'
import { applyForContributor, decideApplication, listPendingApplications, loadCommunityQuestions, loadContributions, loadMyProfile, submitContribution, submitReview } from './lib/contributeDb'
import type { CommunityQuestion, DbContribution, DbProfile } from './lib/contributeDb'
import { WMLogo } from './components/common'
import { CaseView, LearnLibrary, WardMomentIntro } from './components/learn'
import { PracticeCard } from './components/practice'
import { AuthorsView } from './components/authors'
import { AdminQueue, ContributorApplication, SignIn } from './components/auth'
import { Landing } from './components/landing'
import { AboutView } from './components/about'
import { PrivacyView, TermsView } from './components/legal'
import { googleEnabled, onGoogleSession, signInWithGoogle, signOutGoogle } from './auth/googleAuth'
import type { AuthState, Author, ContribState, Draft, LintResult, PendingApp, PracticeItem, PracticeStore } from './types'

type ProgressMap = Record<string, Record<string, boolean>>

export default function App() {
  const [theme, setTheme] = useState<string>(() => loadLS('os_theme', 'light'))
  const [auth, setAuth] = useState<AuthState>(() => loadLS('os_auth', { currentEmail: null, users: JSON.parse(JSON.stringify(DEMO_USERS)) }))
  // When a real backend is configured, roles + application status come from the
  // signed-in user's `profiles` row, not localStorage. `dbPending` holds the
  // admin queue loaded from the DB. Both stay null/empty on the localStorage mock.
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [dbPending, setDbPending] = useState<DbProfile[]>([])
  // The contributor workspace (own + in-review + published, RLS-scoped) and the
  // published community questions for Practice, both DB-backed when configured.
  const [dbContrib, setDbContrib] = useState<DbContribution[]>([])
  const [dbCommunity, setDbCommunity] = useState<CommunityQuestion[]>([])
  const [mode, setMode] = useState('home')
  const [authorSel, setAuthorSel] = useState<Author | null>(null)
  const openAuthor = (a: Author) => { setAuthorSel(a); setMode('authors') }
  const [activeId, setActiveId] = useState<string | null>(null)
  const [progress, setProgressRaw] = useState<ProgressMap>(() => loadLS('os_progress', {}))
  const [review, setReview] = useState<string[]>(() => loadLS('os_review', []))
  const [answers, setAnswersRaw] = useState<Record<string, Record<string, string>>>(() => loadLS('os_answers', {}))
  // reasons are persisted to localStorage via the setter; the value is not read back into the UI
  const [, setReasonsRaw] = useState<Record<string, string>>(() => loadLS('os_reasons', {}))
  const [psub, setPsub] = useState('bank')
  const [pcat, setPcat] = useState('All')
  const [pst, setPst] = useState<PracticeStore>(() => loadLS('os_practice', { att: {}, rate: {} }))
  const [picks, setPicks] = useState<Record<string, number>>({})
  const [boardQS] = useState<PracticeItem[]>(() => boardBankFromJson())
  const [contrib, setContrib] = useState<ContribState>(() => loadLS('os_contrib', { qs: [], counter: 100 }))
  const [csub, setCsub] = useState('author')
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [audit, setAudit] = useState<LintResult | null>(null)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); saveLS('os_theme', theme) }, [theme])
  useEffect(() => { if ('scrollRestoration' in history) history.scrollRestoration = 'manual' }, [])
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [mode, activeId, psub, csub])
  useEffect(() => saveLS('os_practice', pst), [pst])
  useEffect(() => saveLS('os_contrib', contrib), [contrib])
  useEffect(() => saveLS('os_auth', auth), [auth])

  // ---- auth ----
  // With a backend, roles + application status are authoritative from `profile`
  // (the DB). On the localStorage mock they come from the local user record.
  const dbOn = dbEnabled()
  const me = auth.currentEmail ? auth.users[auth.currentEmail] : null
  const isAdmin = dbOn ? profile?.role === 'admin' : (!!me && ADMIN_EMAILS.includes(me.email))
  const isContributor = dbOn
    ? (profile?.role === 'admin' || (profile?.role === 'contributor' && profile?.app_status === 'approved'))
    : (!!me && me.role === 'contributor' && !!me.app && me.app.status === 'approved')
  const appStatus = dbOn ? (profile?.app_status ?? 'none') : (me?.app?.status ?? 'none')
  const userName = (email: string) => { const u = auth.users[email]; return (u && u.name) || email || 'Wards & Boards editorial' }
  const signIn = (email: string, name: string) => setAuth((a) => { const u = { ...a.users }; if (!u[email]) u[email] = { name: name || email, email, role: 'learner', app: { status: 'none' } }; return { ...a, users: u, currentEmail: email } })
  const signOut = () => { if (googleEnabled) signOutGoogle(); setProfile(null); setDbPending([]); setAuth((a) => ({ ...a, currentEmail: null })); setMode('home') }
  const applyContributor = (form: { training: string; institution: string; npi: string }) => {
    if (dbOn) { applyForContributor(form).then((p) => { if (p) setProfile(p) }); return }
    setAuth((a) => {
      if (!a.currentEmail) return a
      const u = { ...a.users }
      const cur = u[a.currentEmail]
      if (!cur) return a
      u[a.currentEmail] = { ...cur, app: { status: 'pending', ...form } }
      return { ...a, users: u }
    })
  }
  const refreshPending = () => { if (dbEnabled()) listPendingApplications().then(setDbPending) }
  const refreshContrib = () => { if (dbEnabled()) loadContributions().then(setDbContrib) }
  const refreshCommunity = () => { if (dbEnabled()) loadCommunityQuestions().then(setDbCommunity) }
  const decideApp = (id: string, decision: string) => {
    if (dbOn) { decideApplication(id, decision === 'approve' ? 'approve' : 'deny').then(refreshPending); return }
    setAuth((a) => {
      const u = { ...a.users }
      const usr = u[id]
      if (!usr) return a
      u[id] = decision === 'approve' ? { ...usr, role: 'contributor', app: { ...usr.app, status: 'approved' } } : { ...usr, app: { ...usr.app, status: 'denied' } }
      return { ...a, users: u }
    })
  }
  // The admin queue, normalized so AdminQueue takes one shape from DB or mock.
  const pendingApps: PendingApp[] = dbOn
    ? dbPending.map((p) => ({ id: p.id, name: p.full_name || p.email || 'Applicant', email: p.email || '', training: p.training || '', institution: p.institution || '', npi: p.npi || '' }))
    : Object.values(auth.users).filter((u) => u.app && u.app.status === 'pending').map((u) => ({ id: u.email, name: u.name, email: u.email, training: u.app.training || '', institution: u.app.institution || '', npi: u.app.npi || '' }))

  // When a real Supabase backend is configured, adopt the signed-in Google
  // identity into the app's user model. No-op (and unsubscribes cleanly) on the mock.
  useEffect(() => onGoogleSession((u) => { if (u && u.email) signIn(u.email, u.name) }), [])

  // Load the signed-in user's DB profile (their real role + application status).
  useEffect(() => {
    if (!me || !dbEnabled()) { setProfile(null); return }
    let cancelled = false
    loadMyProfile().then((p) => { if (!cancelled) setProfile(p) })
    return () => { cancelled = true }
  }, [me?.email])

  // Admins: load the pending-application queue from the DB when viewing Admin.
  useEffect(() => { if (mode === 'admin' && isAdmin) refreshPending() }, [mode, isAdmin])

  // Published community questions (Practice bank) are public; load them once the
  // backend is on. The workspace items follow the signed-in contributor.
  useEffect(() => { refreshCommunity() }, [])
  useEffect(() => { if (me && dbEnabled()) refreshContrib() }, [me?.email])

  // Once signed in with a real backend, load this user's study data from Supabase
  // so progress, ratings, and attempts follow them across devices.
  useEffect(() => {
    if (!me || !dbEnabled()) return
    let cancelled = false
    loadStudyData().then((d) => {
      if (cancelled || !d) return
      setPst({ att: d.att, rate: d.rate })
      setProgressRaw(d.progress)
    })
    return () => { cancelled = true }
  }, [me?.email])

  const cases = CASES.filter((c) => c.active !== false)
  const setProgress = (u: ProgressMap | ((p: ProgressMap) => ProgressMap)) => setProgressRaw((prev) => { const np = typeof u === 'function' ? u(prev) : u; saveLS('os_progress', np); return np })
  const toggleReview = (id: string) => setReview((prev) => { const np = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]; saveLS('os_review', np); return np })
  const setAnswers = (id: string, pid: string, v: string) => setAnswersRaw((prev) => { const np = { ...prev, [id]: { ...(prev[id] || {}), [pid]: v } }; saveLS('os_answers', np); return np })
  const setReasonAnswer = (id: string, txt: string) => setReasonsRaw((prev) => { const np = { ...prev, [id]: txt }; saveLS('os_reasons', np); return np })
  const openCase = (id: string) => { setActiveId(id); setMode('learn') }
  const goHome = () => { setMode('home'); setActiveId(null) }
  const goCase = (id: string | null) => { setMode('learn'); setActiveId(id) }
  const caseData = cases.find((c) => c.id === activeId)

  const pubContrib: PracticeItem[] = dbOn
    ? dbCommunity.map((c) => {
        const it = {
          id: 'community-' + c.id, caseId: null, qkey: 'community:' + c.id, caseTitle: '', system: c.system, topic: '',
          vignette: c.vignette, leadIn: c.lead_in, options: c.options, answerIndex: c.answer_index, explanation: c.explanation,
          source: 'Community', citableId: c.citable_id, attribution: communityAttribution(c),
        } as PracticeItem
        it.lint = boardLint(it)
        return it
      })
    : contrib.qs.filter((q) => q.status === 'published').map((q) => { const it = { ...q, source: 'Community' } as unknown as PracticeItem; it.lint = boardLint(it); return it })
  const QS = [...boardQS, ...pubContrib]
  const caseCount = new Set(boardQS.map((q) => q.caseId)).size
  const ready = QS.filter((q) => q.lint.ok).length
  const lastAtt = (qid: string) => { const a = pst.att[qid] || []; return a.length ? a[a.length - 1] : null }
  const due = QS.filter((q) => { const l = lastAtt(q.id); return l && !l.correct })
  const bankCats = (() => { const pr: string[] = []; CATEGORY_ORDER.forEach((k) => { if (QS.some((q) => categoryOf(q.system) === k)) pr.push(k) }); QS.forEach((q) => { const k = categoryOf(q.system); if (!pr.includes(k)) pr.push(k) }); return ['All', ...pr] })()
  const bankList = pcat === 'All' ? QS : QS.filter((q) => categoryOf(q.system) === pcat)
  const pick = (qid: string, i: number, correct: boolean) => { setPicks((s) => ({ ...s, [qid]: i })); if (me) { setPst((s) => { const att = { ...s.att }; att[qid] = [...(att[qid] || []), { correct }]; return { ...s, att } }); recordAttempt(qid, correct) } }
  const rate = (qid: string, n: number) => { setPst((s) => ({ ...s, rate: { ...s.rate, [qid]: n } })); saveRating(qid, n) }
  const submitDraft = () => {
    if (!me) return
    const a = boardLint(draft)
    setAudit(a)
    if (!a.ok) return
    if (dbOn) submitContribution(draft).then(refreshContrib)
    else setContrib((s) => enqueueDraft(s, draft, me.email))
    setDraft(blankDraft); setAudit(null); setCsub('review')
  }
  const reviewItem = (qid: string, decision: string) => {
    if (!me) return
    if (dbOn) submitReview(qid, decision === 'approve' ? 'approve' : 'reject').then(() => { refreshContrib(); refreshCommunity() })
    else setContrib((s) => applyReview(s, qid, me.email, decision))
  }
  // Normalized contributor-workspace items (DB or mock), plus this user's id in
  // whichever space the data lives (uuid for the DB, email for the mock).
  const myId = dbOn ? (profile?.id ?? '') : (me?.email ?? '')
  const workItems = dbOn
    ? dbContrib.map((c) => ({ id: c.id, system: c.system, level: c.level, vignette: c.vignette, leadIn: c.lead_in, options: c.options, answerIndex: c.answer_index, explanation: c.explanation, status: c.status, citableId: c.citable_id, authorId: c.author_id, authorName: c.author_name, reviews: c.reviews.map((r) => ({ reviewerId: r.reviewer_id, reviewerName: r.reviewer_name, decision: r.decision })) }))
    : contrib.qs.map((q) => ({ id: q.id, system: q.system, level: q.level, vignette: q.vignette, leadIn: q.leadIn, options: q.options, answerIndex: q.answerIndex, explanation: q.explanation, status: q.status, citableId: q.citableId, authorId: q.authorId, authorName: userName(q.authorId), reviews: q.reviews.map((r) => ({ reviewerId: r.reviewerId, reviewerName: userName(r.reviewerId), decision: r.decision })) }))

  const PracticeBank = ({ list, empty }: { list: PracticeItem[]; empty: ReactNode }) => (
    <div>
      {list.length === 0 ? <div className="inprog">{empty}</div> :
        list.map((q) => <PracticeCard key={q.id} q={q} picked={picks[q.id]} onPick={(i) => pick(q.id, i, i === q.answerIndex)}
          rated={pst.rate[q.id] || 0} onRate={(n) => rate(q.id, n)} onGoCase={() => goCase(q.caseId)} onOpenAuthor={openAuthor} />)}
    </div>
  )

  const PracticeView = () => (
    <section className="section" style={{ paddingTop: 34 }}><div className="wrap">
      <div className="sec-head"><div className="kicker">Practice · board questions</div><h2 className="h2">Practice on the same topics</h2>
        <p className="sec-lead">New to a topic? Start in Learn, then return here to test yourself.</p></div>
      <div className="cat-tabs">
        <button className={'cat-tab ' + (psub === 'bank' ? 'active' : '')} onClick={() => setPsub('bank')}>Question bank<span className="cat-count">{QS.length}</span></button>
        <button className={'cat-tab ' + (psub === 'srq' ? 'active' : '')} onClick={() => { setPsub('srq'); setPicks({}) }}>Spaced review<span className="cat-count">{due.length}</span></button>
        <button className={'cat-tab ' + (psub === 'prog' ? 'active' : '')} onClick={() => setPsub('prog')}>My progress</button>
      </div>
      {psub === 'bank' && (
        <>
          <div className="banner">{boardQS.length} board questions written from {caseCount} Ward Moments cases and run through the Forge gate{pubContrib.length ? ', plus ' + pubContrib.length + ' community-published' : ''}. {ready} of {QS.length} pass every hard board-exam check. Each links back to its case in Learn.</div>
          <div className="cat-tabs">{bankCats.map((t) => { const count = t === 'All' ? QS.length : QS.filter((q) => categoryOf(q.system) === t).length; return (<button key={t} className={'cat-tab ' + (pcat === t ? 'active' : '')} onClick={() => setPcat(t)}>{t === 'All' ? 'All topics' : t}<span className="cat-count">{count}</span></button>) })}</div>
          <PracticeBank list={bankList} empty={<p>No questions in this category yet.</p>} />
        </>
      )}
      {psub === 'srq' && (
        <>
          <div className="banner">Questions you miss come back here until you get them right. {due.length} due now.</div>
          <PracticeBank list={due} empty={<p>Nothing due. Miss a few in the question bank and they will queue up here.</p>} />
        </>
      )}
      {psub === 'prog' && (() => {
        const atts: { correct: boolean; system: string }[] = []
        QS.forEach((q) => (pst.att[q.id] || []).forEach((a) => atts.push({ ...a, system: q.system })))
        const seen = new Set<string>()
        QS.forEach((q) => { if ((pst.att[q.id] || []).length) seen.add(q.id) })
        const total = atts.length, correct = atts.filter((a) => a.correct).length, acc = total ? Math.round((100 * correct) / total) : 0
        const bySys: Record<string, { c: number; t: number }> = {}
        atts.forEach((a) => { (bySys[a.system] = bySys[a.system] || { c: 0, t: 0 }).t++; if (a.correct) bySys[a.system].c++ })
        return (
          <div>
            <div className="how-grid" style={{ marginBottom: 18 }}>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Questions seen</div><div className="stat-num">{seen.size}</div></div>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Total answers</div><div className="stat-num">{total}</div></div>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Accuracy</div><div className={'stat-num ' + (acc >= 70 ? 'good' : 'warn')}>{acc}%</div></div>
              <div className="how-card"><div style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>Due for review</div><div className={'stat-num ' + (due.length ? 'warn' : 'good')}>{due.length}</div></div>
            </div>
            <div className="qblock"><div className="reveal-title">Accuracy by system</div>
              {Object.keys(bySys).length === 0 ? <p style={{ color: 'var(--dim)', marginTop: 8 }}>Answer some questions to see your breakdown.</p> :
                Object.entries(bySys).map(([s, v]) => { const pc = Math.round((100 * v.c) / v.t); return (<div key={s} style={{ margin: '10px 0' }}><div style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: 5 }}>{s} — {v.c}/{v.t} ({pc}%)</div><div className="os-bar"><div style={{ width: pc + '%' }} /></div></div>) })}</div>
          </div>
        )
      })()}
    </div></section>
  )

  const ContributeWorkspace = () => {
    if (!me) return null
    return (
      <section className="section" style={{ paddingTop: 34 }}><div className="wrap">
        <div className="sec-head"><div className="kicker">Contribute · {me.name}</div><h2 className="h2">Author and peer-review board questions</h2></div>
        <div className="step-row">
          <div className="step-card"><div className="step-n">1</div><div><h3>Write it</h3><p>You draft a question; the Forge quality gate checks it against board item-writing rules.</p></div></div>
          <div className="step-card"><div className="step-n">2</div><div><h3>Peer reviewed</h3><p>Two independent physicians review the item and approve it, request changes, or reject it.</p></div></div>
          <div className="step-card"><div className="step-n">3</div><div><h3>Selected &amp; published</h3><p>Approved questions are selected into the Practice bank with a citable ID. Learners then rate their quality.</p></div></div>
        </div>
        <div className="banner">{dbOn ? 'Two independent contributors must approve an item before it publishes to the Practice bank. You cannot review your own questions.' : 'To play out the two-reviewer flow, sign in as different contributors (use the demo accounts): author as one, then approve as two others.'}</div>
        <div className="cat-tabs">
          <button className={'cat-tab ' + (csub === 'author' ? 'active' : '')} onClick={() => setCsub('author')}>Write a question</button>
          <button className={'cat-tab ' + (csub === 'review' ? 'active' : '')} onClick={() => setCsub('review')}>Review queue<span className="cat-count">{workItems.filter((q) => q.status === 'in_review').length}</span></button>
          <button className={'cat-tab ' + (csub === 'cv' ? 'active' : '')} onClick={() => setCsub('cv')}>Contribution record</button>
        </div>
        {csub === 'author' && (
          <div className="qblock">
            <div className="os-grid" style={{ marginBottom: 12 }}>
              <div><div className="prompt-q" style={{ marginBottom: 6 }}>Exam level</div>
                <select className="os-input" value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}><option value="step1">Step 1 (mechanism)</option><option value="shelf">Shelf / Step 2 (clinical)</option></select></div>
              <div><div className="prompt-q" style={{ marginBottom: 6 }}>System / topic</div>
                <input className="os-input" value={draft.system} onChange={(e) => setDraft({ ...draft, system: e.target.value })} placeholder="e.g. Cardiology" /></div>
            </div>
            <div className="prompt-q" style={{ marginBottom: 6 }}>Clinical vignette</div>
            <textarea className="answer-textarea" value={draft.vignette} onChange={(e) => setDraft({ ...draft, vignette: e.target.value })} placeholder="A 68-year-old patient comes to..." />
            <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Lead-in</div>
            <input className="os-input" value={draft.leadIn} onChange={(e) => setDraft({ ...draft, leadIn: e.target.value })} placeholder="Which of the following is the most likely diagnosis?" />
            <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Options (select the correct one)</div>
            {draft.options.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0' }}>
                <input type="radio" checked={draft.answerIndex === i} onChange={() => setDraft({ ...draft, answerIndex: i })} />
                <input className="os-input" value={o} onChange={(e) => { const op = [...draft.options]; op[i] = e.target.value; setDraft({ ...draft, options: op }) }} placeholder={'Option ' + String.fromCharCode(65 + i)} /></div>
            ))}
            <div className="prompt-q" style={{ margin: '12px 0 6px' }}>Explanation</div>
            <textarea className="answer-textarea" value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} placeholder="Why the key is right and each distractor is wrong." />
            <div style={{ marginTop: 14 }}><button className="submit-btn" style={{ marginTop: 0 }} onClick={submitDraft}>Run Forge gate &amp; submit for peer review</button></div>
            {audit && (
              <div className="feedback" style={{ borderLeftColor: audit.ok ? 'var(--good)' : 'var(--bad)' }}>
                <div className="fb-result" style={{ color: audit.ok ? 'var(--good)' : 'var(--bad)' }}>{audit.ok ? '✓ Passed the Forge gate, sent to peer review' : '✗ Fix these before submitting:'}</div>
                {audit.fails.map((f, i) => <div key={i} style={{ color: 'var(--warn)', fontSize: '0.85rem' }}>• {f}</div>)}</div>
            )}
          </div>
        )}
        {csub === 'review' && (workItems.filter((q) => q.status === 'in_review').length === 0 ?
          <div className="inprog"><p>Review queue is empty. Write a question, then sign in as another approved contributor to review it.</p></div> :
          workItems.filter((q) => q.status === 'in_review').map((q) => {
            const a = boardLint(q)
            const isAuthor = q.authorId === myId
            const mine = q.reviews.find((r) => r.reviewerId === myId)
            const ap = q.reviews.filter((r) => r.decision === 'approve').length
            return (
              <div className="qblock" key={q.id}>
                <div className="qid"><span className="os-badge polish">in review</span> <span style={{ color: 'var(--mid)', textTransform: 'none', letterSpacing: 0, fontWeight: 700, marginLeft: 6 }}>{q.system || 'untagged'} · by {q.authorName} · {ap}/2 approvals</span></div>
                <div className="vignette"><div className="vignette-label">Clinical Vignette</div>{q.vignette}</div>
                <p className="qstem">{q.leadIn}</p>
                <div className="choices">{q.options.map((o, i) => (<div key={i} className={'choice ' + (i === q.answerIndex ? 'correct' : '')}><span className="choice-letter">{String.fromCharCode(65 + i)}</span><span>{o}</span></div>))}</div>
                <div className="feedback">{q.explanation}
                  <div style={{ marginTop: 8, fontSize: '0.84rem', color: a.ok ? 'var(--good)' : 'var(--bad)' }}>Forge gate: {a.ok ? 'all hard checks pass' : a.fails.length + ' issue(s): ' + a.fails.join(', ')}</div>
                  {isAuthor && <div style={{ color: 'var(--warn)', fontSize: '0.84rem', marginTop: 6 }}>You authored this; you cannot review your own item.</div>}
                  {mine && !isAuthor && <div style={{ color: 'var(--warn)', fontSize: '0.84rem', marginTop: 6 }}>You already reviewed this item.</div>}
                  {!isAuthor && !mine && (
                    <div className="case-actions">
                      <button className="submit-btn" style={{ marginTop: 0, background: 'var(--good)' }} onClick={() => reviewItem(q.id, 'approve')}>Approve</button>
                      <button className="ghost-btn" onClick={() => reviewItem(q.id, 'reject')}>Reject</button></div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--dim)', marginTop: 8 }}>Two physician approvals publish the item into the Practice bank and mint its citable ID.</div></div>
              </div>
            )
          }))}
        {csub === 'cv' && (
          <div className="qblock">
            {(() => {
              const authored = workItems.filter((q) => q.status === 'published' && q.authorId === myId)
              const reviewed = workItems.filter((q) => q.status === 'published' && q.reviews && q.reviews.some((r) => r.reviewerId === myId && r.decision === 'approve'))
              const cred = dbOn ? (profile?.training || '') : (me.app && me.app.training ? me.app.training : '')
              const lines = [me.name + (cred ? ', ' + cred : ''), 'Wards & Boards Question Commons, contribution record (as of June 2026)', '', 'PEER-REVIEWED QUESTIONS AUTHORED (' + authored.length + '):']
              authored.forEach((q) => lines.push('  ' + q.citableId + '  ' + (q.system || '') + ' (' + (q.level === 'step1' ? 'Step 1' : 'Shelf') + '). Reviewers: ' + q.reviews.filter((r) => r.decision === 'approve').map((r) => r.reviewerName).join(', ') + '.'))
              if (!authored.length) lines.push('  (none yet)')
              lines.push('', 'PEER REVIEW SERVICE (' + reviewed.length + '):')
              reviewed.forEach((q) => lines.push('  ' + q.citableId + '  ' + (q.system || '') + '. Served as peer reviewer.'))
              if (!reviewed.length) lines.push('  (none yet)')
              const text = lines.join('\n')
              return (
                <div><div className="reveal-title">Citable contribution record</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--mid)', margin: '6px 0 12px' }}>Every published item is a citable micro-publication, creditable to its author and both reviewers, the incentive that builds the bank for free.</p>
                  <pre className="os-pre">{text}</pre>
                  <button className="os-link" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(text)}>Copy for CV</button></div>
              )
            })()}
          </div>
        )}
      </div></section>
    )
  }

  return (
    <>
      <nav><div className="nav-inner">
        <button className="brand" onClick={goHome}><WMLogo /><span className="brand-name"><span>Wards</span><span className="stem">&nbsp;&amp; Boards</span></span><span className="brand-tag">wardsandboards.com</span></button>
        <div className="nav-pages">
          <button className={'nav-link ' + (mode === 'home' ? 'active' : '')} onClick={goHome}>Home</button>
          <button className={'nav-link ' + (mode === 'learn' ? 'active' : '')} onClick={() => { setActiveId(null); setMode('learn') }}>Learn</button>
          <button className={'nav-link ' + (mode === 'practice' ? 'active' : '')} onClick={() => setMode('practice')}>Practice</button>
          <button className={'nav-link ' + (mode === 'contribute' ? 'active' : '')} onClick={() => setMode('contribute')}>Contribute</button>
          <button className={'nav-link ' + (mode === 'authors' ? 'active' : '')} onClick={() => { setAuthorSel(null); setMode('authors') }}>Authors</button>
          <button className={'nav-link ' + (mode === 'about' ? 'active' : '')} onClick={() => setMode('about')}>About</button>
          {isAdmin && <button className={'nav-link ' + (mode === 'admin' ? 'active' : '')} onClick={() => setMode('admin')}>Admin</button>}
        </div>
        <div className="nav-user">
          {me ? (
            <span className="usermenu"><span className="userchip">{me.name}</span>
              <span className={'rolebadge ' + (isAdmin ? 'admin' : isContributor ? 'contributor' : 'learner')}>{isAdmin ? 'admin' : isContributor ? 'contributor' : 'learner'}</span>
              <button className="nav-link" onClick={signOut}>Sign out</button></span>
          ) : <button className="nav-link" onClick={() => setMode('signin')}>Sign in</button>}
          <button className="theme-toggle" title="Toggle light / dark" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </div></nav>

      {mode === 'home' && <Landing exampleCase={cases[0]} examplePractice={boardQS[0]} signedIn={!!me}
        onGetStarted={() => { if (me) { setActiveId(null); setMode('learn') } else setMode('signin') }}
        onGoLearn={() => { setActiveId(null); setMode('learn') }} onGoPractice={() => setMode('practice')} />}

      {mode === 'signin' && <SignIn users={auth.users} onSignIn={(em, nm) => { signIn(em, nm); setMode('home') }} onGoogle={googleEnabled ? signInWithGoogle : undefined} googleLive={googleEnabled} />}

      {mode === 'learn' && (!me ? <SignIn intent="Learn" users={auth.users} onSignIn={(em, nm) => { signIn(em, nm); setMode('learn') }} onGoogle={googleEnabled ? signInWithGoogle : undefined} googleLive={googleEnabled} />
        : caseData ? (
          <CaseView caseData={caseData} onBack={() => { setActiveId(null); setMode('learn') }} setProgress={setProgress}
            review={review} onToggleReview={toggleReview} answers={answers[caseData.id] || {}} setAnswers={setAnswers}
            setReasonAnswer={setReasonAnswer} onOpenAuthor={openAuthor} onComplete={(caseId, mode) => saveCaseProgress(caseId, mode)} />
        ) : (
          <section className="section" style={{ paddingTop: 30 }}><div className="wrap">
            <WardMomentIntro />
            <div className="sec-head"><div className="kicker">Ward moments</div><h2 className="h2">Pick a ward moment to start</h2></div>
            <LearnLibrary cases={cases} onOpen={openCase} progress={progress} review={review} onToggleReview={toggleReview} />
          </div></section>
        ))}

      {mode === 'practice' && (!me ? <SignIn intent="Practice" users={auth.users} onSignIn={(em, nm) => { signIn(em, nm); setMode('practice') }} onGoogle={googleEnabled ? signInWithGoogle : undefined} googleLive={googleEnabled} /> : <PracticeView />)}

      {mode === 'contribute' && (!me ? <SignIn intent="Contribute" users={auth.users} onSignIn={(em, nm) => { signIn(em, nm); setMode('contribute') }} onGoogle={googleEnabled ? signInWithGoogle : undefined} googleLive={googleEnabled} />
        : !isContributor ? <section className="section" style={{ paddingTop: 34 }}><div className="wrap"><ContributorApplication name={me.name} appStatus={appStatus} onApply={applyContributor} /></div></section>
          : <ContributeWorkspace />)}

      {mode === 'authors' && <AuthorsView sel={authorSel} setSel={setAuthorSel} />}

      {mode === 'about' && <AboutView />}

      {mode === 'privacy' && <PrivacyView />}

      {mode === 'terms' && <TermsView />}

      {mode === 'admin' && isAdmin && (
        <section className="section" style={{ paddingTop: 34 }}><div className="wrap">
          <div className="sec-head"><div className="kicker">Admin</div><h2 className="h2">Contributor applications</h2></div>
          <AdminQueue pending={pendingApps} onDecide={decideApp} />
        </div></section>
      )}

      <footer><div className="foot-inner">
        <div className="foot-left">Wards & Boards · learn the why, then practice the questions · built by a practicing hospitalist</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className="nav-link" onClick={() => setMode('about')}>About</button>
          <button className="nav-link" onClick={() => setMode('privacy')}>Privacy</button>
          <button className="nav-link" onClick={() => setMode('terms')}>Terms</button>
        </div>
        <div className="foot-right">WARDS &amp; BOARDS</div></div></footer>
    </>
  )
}
