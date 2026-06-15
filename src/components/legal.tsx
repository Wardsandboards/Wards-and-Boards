import type { ReactNode, CSSProperties } from 'react'

// Update this to wherever you want to receive privacy/legal questions.
const CONTACT_EMAIL = 'contact@wardsandboards.com'
const LAST_UPDATED = 'June 12, 2026'

const para: CSSProperties = { fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: 1.7, margin: '0 0 12px' }

function LegalShell({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro: string; children: ReactNode }) {
  return (
    <>
      <header className="hero"><div className="wrap">
        <div className="hero-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="hero-sub">{intro}</p>
        <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--dim)' }}>Last updated: {LAST_UPDATED}</div>
      </div></header>
      <section className="section"><div className="wrap" style={{ maxWidth: 760 }}>{children}</div></section>
    </>
  )
}

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 className="h2" style={{ fontSize: '1.3rem', marginBottom: 10 }}>{heading}</h2>
      {children}
    </div>
  )
}

export function PrivacyView() {
  return (
    <LegalShell
      eyebrow="Privacy Policy"
      title={<>How Wards &amp; Boards handles your <em>data</em></>}
      intro="This policy explains what information Wards & Boards collects, how it is used, and the choices you have. Wards & Boards is a free educational resource operated by an individual physician."
    >
      <Block heading="Information we collect">
        <p style={para}><strong>Account information.</strong> When you sign in with Google, we receive your name, email address, and profile photo, and store them to create your account.</p>
        <p style={para}><strong>Learning activity.</strong> Your progress through cases, your quiz answers and attempts, and any ratings you give to questions.</p>
        <p style={para}><strong>Contributor information.</strong> If you apply to author or review questions, the training level, institution, and NPI number or profile link you provide. This is used only to confirm you are a resident physician or above.</p>
        <p style={para}><strong>Technical information.</strong> Standard server logs (such as IP address and browser type) kept by our hosting providers for security and reliability.</p>
      </Block>

      <Block heading="How we use your information">
        <p style={para}>We use your information to operate the service: to save your progress across devices, to show your contributions and the credit attached to them, and to run the question bank. Contributor details are used to verify eligibility. Technical logs help us keep the service secure and working.</p>
        <p style={para}>We do not show ads, and <strong>we do not sell or rent your personal information</strong> to anyone.</p>
      </Block>

      <Block heading="Service providers we use">
        <p style={para}>We rely on a small number of providers that process data on our behalf: <strong>Google</strong> (sign-in), <strong>Supabase</strong> (database and authentication hosting), and <strong>GitHub Pages</strong> (website hosting). They handle data under their own security and privacy terms. We do not share your data with third parties for their own marketing.</p>
      </Block>

      <Block heading="Your choices and rights">
        <p style={para}>You can sign out at any time. You can ask us to access, correct, or delete your account and the data associated with it by emailing <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a>. We will respond within a reasonable time.</p>
      </Block>

      <Block heading="Data retention">
        <p style={para}>We keep your account data while your account is active. If you ask us to delete it, we remove your personal data, except where we must retain certain records for legal or security reasons.</p>
      </Block>

      <Block heading="Security">
        <p style={para}>Access to your data is restricted by database security rules, so you can only view and change your own records. No system is perfectly secure, but we take reasonable measures to protect your information.</p>
      </Block>

      <Block heading="Who this is for">
        <p style={para}>Wards &amp; Boards is intended for medical students, physicians, and other adult learners. It is not directed to children under 13, and we do not knowingly collect their information.</p>
      </Block>

      <Block heading="Changes to this policy">
        <p style={para}>We may update this policy from time to time. We will revise the "last updated" date above, and significant changes will be noted on the site.</p>
      </Block>

      <Block heading="Contact">
        <p style={para}>Questions about this policy? Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a>.</p>
      </Block>
    </LegalShell>
  )
}

export function TermsView() {
  return (
    <LegalShell
      eyebrow="Terms of Service"
      title={<>Terms of <em>use</em></>}
      intro="These terms govern your use of Wards & Boards, a free educational resource. By using the site, you agree to them."
    >
      <Block heading="What Wards & Boards is">
        <p style={para}>Wards &amp; Boards is a free teaching resource that pairs clinical-physiology cases with board-style practice questions, written and reviewed by physicians. It is provided at no cost.</p>
      </Block>

      <Block heading="Educational use only, not medical advice">
        <p style={para}>The content is for education and exam preparation. <strong>It is not medical advice and must not be used to diagnose or treat any patient or person.</strong> Always rely on your own clinical judgment, your supervising physicians, and primary sources.</p>
      </Block>

      <Block heading="Your account">
        <p style={para}>You are responsible for activity under your account and for the accuracy of the information you provide. To become a contributor you must be a resident physician or above, and the verification details you provide must be truthful.</p>
      </Block>

      <Block heading="Contributions">
        <p style={para}>If you author or review questions, you confirm the work is your own and accurate to the best of your knowledge, and that it does not copy copyrighted material or infringe anyone's rights. You grant Wards &amp; Boards a non-exclusive, royalty-free license to publish, display, and distribute your contributions on the platform as part of the free question commons. You keep authorship credit on your published items.</p>
      </Block>

      <Block heading="Acceptable use">
        <p style={para}>Use the site for its intended educational purpose. Do not attempt to break, overload, or bulk-scrape the service, and do not try to access other users' accounts or data.</p>
      </Block>

      <Block heading="Intellectual property">
        <p style={para}>The Wards &amp; Boards name, design, and code belong to the operator. Physician-authored questions remain credited to their authors.</p>
      </Block>

      <Block heading="Disclaimers">
        <p style={para}>The service is provided "as is," without warranties of any kind. We do not guarantee that the content is complete, current, or error-free, or that the service will be uninterrupted.</p>
      </Block>

      <Block heading="Limitation of liability">
        <p style={para}>To the fullest extent permitted by law, the operator is not liable for any damages arising from your use of, or inability to use, the service.</p>
      </Block>

      <Block heading="Changes to these terms">
        <p style={para}>We may update these terms. Continued use after a change means you accept the updated terms, and the "last updated" date will reflect the change.</p>
      </Block>

      <Block heading="Contact">
        <p style={para}>Questions about these terms? Email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a>.</p>
      </Block>
    </LegalShell>
  )
}
