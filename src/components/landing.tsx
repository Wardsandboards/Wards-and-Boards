import { Pyramid, StarlingCurve } from './common'
import { MiniQuestion } from './learn'
import { LandingPractice } from './practice'
import type { Case, PracticeItem } from '../types'

export function Landing({ exampleCase, examplePractice, signedIn, onGetStarted, onGoLearn, onGoPractice, onDemo }: {
  exampleCase?: Case
  examplePractice?: PracticeItem
  signedIn: boolean
  onGetStarted: () => void
  onGoLearn: () => void
  onGoPractice: () => void
  onDemo?: () => void
}) {
  return (
    <>
      <header className="hero"><div className="wrap">
        <div className="hero-eyebrow">Clinical physiology for medical students</div>
        <h1>Climb from the basics to <em>wards and boards</em>.</h1>
        <p className="hero-sub">Wards & Boards pairs short teaching cases with board questions peer-reviewed by physicians, all on the same topics.
          Understand the mechanism first in Learn, then test your recall in Practice.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onGetStarted}>{signedIn ? 'Go to Learn →' : 'Get started →'}</button>
          <button className="ghost-btn" onClick={onGoPractice}>Try practice questions</button>
          {!signedIn && onDemo && <button className="ghost-btn" onClick={onDemo}>Preview as a demo student</button>}</div>
        <div className="hero-note">Written and reviewed by physicians. Physiology checked against current peer-reviewed research.</div>
      </div></header>
      <section className="section" style={{ paddingBottom: 8 }}><div className="wrap">
        <div className="sec-head"><div className="kicker">How it works</div><h2 className="h2">First learn, then practice</h2>
          <p className="sec-lead">Learning builds in tiers. Start at the base in Learn, then climb through board questions in Practice until you are ready for wards and boards.</p></div>
        <div className="climb-row"><Pyramid />
          <div className="climb-steps">
            <div className="step-card"><div className="step-n">1</div><div><h3>Learn the concept</h3><p>Open a case: predict the answer to a real rounds question, work the physiology, and see the mechanism with a graph.</p></div></div>
            <div className="step-card"><div className="step-n">2</div><div><h3>Practice the questions</h3><p>Move to Practice for board-style questions on the same topics, with a full explanation after each.</p></div></div>
            <div className="step-card"><div className="step-n">3</div><div><h3>Reinforce and retain</h3><p>Missed questions return through spaced repetition, the retrieval practice that moves knowledge into long-term memory.</p></div></div>
          </div>
        </div>
      </div></section>
      <section className="section" style={{ paddingTop: 8 }}><div className="wrap">
        <div className="sec-head"><div className="kicker">Quality</div><h2 className="h2">How the questions are made</h2>
          <p className="sec-lead">Every question is written by a physician and reviewed by the Wards & Boards review board before it is selected into the bank, the same one-best-answer standard used on board exams.</p></div>
        <div className="step-row">
          <div className="step-card"><div className="step-n">1</div><div><h3>Written by physicians</h3><p>A physician or resident drafts each question and runs it through an automated quality gate for board item-writing rules.</p></div></div>
          <div className="step-card"><div className="step-n">2</div><div><h3>Reviewed by the board</h3><p>The Wards & Boards review board reviews the item for accuracy and fairness before it can be published.</p></div></div>
          <div className="step-card"><div className="step-n">3</div><div><h3>Selected and published</h3><p>Approved questions are selected into the bank, and learners can rate their quality over time.</p></div></div>
        </div>
        <div className="contrib-callout"><div className="kicker">Contribute</div>
          <h3>Write a question, earn a citable publication</h3>
          <p>Physicians and residents can author and review questions. Each accepted item becomes a peer-reviewed, citable micro-publication with a stable identifier, credit you can list on a CV.</p>
          <div className="mini-steps"><span className="mini-step">1 · Write it</span><span className="mini-arrow">→</span><span className="mini-step">2 · Reviewed by the board</span><span className="mini-arrow">→</span><span className="mini-step">3 · Published and citable</span></div>
          <div className="cite-example"><div className="cite-h">Example citation</div><code>Rivera A. Decompensated heart failure and the Frank-Starling relationship. Wards & Boards Question Commons, 2026; WB-2026-0007. Reviewed by the Wards & Boards review board.</code></div>
        </div>
      </div></section>
      <section className="section" style={{ paddingTop: 8 }}><div className="wrap">
        <div className="sec-head"><div className="kicker">See it in action</div><h2 className="h2">One topic, from wards to boards</h2>
          <p className="sec-lead">Follow heart failure end to end: first understand the mechanism in Learn, then test recall with a board question in Practice.</p></div>
        <div className="example-flow">
          <div className="flow-step-label"><span className="flow-step-n">1</span> In Learn, it starts with a ward moment</div>
          {exampleCase && (
            <div className="ward"><div className="ward-label"><span className="brand-dot" /> Ward Moment</div>
              <div className="ward-scn">{exampleCase.wardMoment.scenario}</div>
              <div className="ward-why">💡 A "ward moment" is the kind of question an attending actually asks on rounds. You meet these on your clerkships and in residency, so each case starts there, then works back to the physiology.</div></div>
          )}
          <div className="flow-sub">Then work the mechanism on an interactive graph</div>
          <StarlingCurve compact />
          <div className="flow-sub">...and predict the answer to the ward moment</div>
          {exampleCase && <MiniQuestion q={exampleCase.ms1.questions[0]} caseId={exampleCase.id} />}
          <div style={{ marginTop: 14 }}><button className="ghost-btn" onClick={onGoLearn}>Open the full case in Learn →</button></div>
          <div className="flow-arrow-down">↓  then test recall on the same topic</div>
          <div className="flow-step-label"><span className="flow-step-n">2</span> In Practice, a board-style question</div>
          <LandingPractice q={examplePractice} />
          <div style={{ marginTop: 14 }}><button className="ghost-btn" onClick={onGoPractice}>More questions in Practice →</button></div>
        </div>
      </div></section>
    </>
  )
}
