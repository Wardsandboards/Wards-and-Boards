import type { Author } from '../types'

export const COMMUNITY_AUTHORS: Author[] = [
  {
    id: 'rivera', name: 'Dr. Ana Rivera', creds: 'MD', role: 'Cardiology Fellow', institution: 'Stanford Medicine', color: '#3b82f6', initials: 'AR', photo: null, followers: 312, orcid: '0000-0002-1825-0097',
    published: 24, reviews: 38, stars: 4.8, joined: 'Jan 2026',
    badges: [['★', 'Founding author'], ['▲', 'Top author'], ['✚', '25 published'], ['✦', 'Five-star author']],
    bio: 'Cardiology fellow who built most of the cardiovascular physiology set.',
    qs: [['Frank-Starling in decompensated heart failure', 'Cardiology', 4.9, 'WB-2026-0007'], ['Coronary perfusion in diastole', 'Cardiology', 4.7, 'WB-2026-0012'], ['Aortic stenosis and exertional syncope', 'Cardiology', 4.8, 'WB-2026-0018']],
  },
  {
    id: 'chen', name: 'Dr. Marcus Chen', creds: 'MD', role: 'Internal Medicine Resident, PGY-3', institution: 'Stanford Medicine', color: '#8b5cf6', initials: 'MC', photo: null, followers: 408, orcid: '0000-0001-5109-3700',
    published: 17, reviews: 52, stars: 4.9, joined: 'Jan 2026',
    badges: [['✓', 'Top reviewer'], ['★', 'Founding author'], ['◆', "Editors' pick"], ['✦', 'Five-star author']],
    bio: 'Internal medicine resident; reviews more questions than anyone on the platform.',
    qs: [['Hyperkalemia and the resting membrane potential', 'Cardiology', 4.9, 'WB-2026-0021'], ['V/Q mismatch in pneumonia', 'Pulmonology', 4.8, 'WB-2026-0024']],
  },
  {
    id: 'okafor', name: 'Dr. Tomi Okafor', creds: 'MD', role: 'Hospitalist', institution: 'UC Irvine', color: '#10b981', initials: 'TO', photo: null, followers: 156, orcid: '0000-0003-4180-1234',
    published: 12, reviews: 20, stars: 4.7, joined: 'Feb 2026',
    badges: [['▲', 'Rising author'], ['✚', '10 published']],
    bio: 'Hospitalist focused on the hematology and acid-base sets.',
    qs: [['Iron-deficiency anemia: small, pale cells', 'Hematology', 4.7, 'WB-2026-0028'], ['B12 deficiency and macrocytosis', 'Hematology', 4.6, 'WB-2026-0031']],
  },
  {
    id: 'patel', name: 'Dr. Sana Patel', creds: 'MD, MPH', role: 'Nephrology Fellow', institution: 'UCSF', color: '#f59e0b', initials: 'SP', photo: null, followers: 74, orcid: '0000-0002-7898-5678',
    published: 9, reviews: 14, stars: 4.6, joined: 'Mar 2026',
    badges: [['▲', 'Rising author']],
    bio: 'Nephrology fellow writing the renal and electrolyte questions.',
    qs: [['Anemia of chronic kidney disease', 'Hematology', 4.6, 'WB-2026-0034']],
  },
]

export const BADGE_CATALOG: [string, string, string][] = [
  ['★', 'Founding author', 'One of the first physicians to publish on the platform.'],
  ['▲', 'Rising author', 'Your first question is published and live to learners.'],
  ['✚', 'Milestones', 'Awarded at 10, 25, and 50 published questions.'],
  ['✓', 'Top reviewer', "Earned after 25 careful peer reviews of others' items."],
  ['◆', "Editors' pick", 'An item chosen as an exemplar for the question bank.'],
  ['✦', 'Five-star author', 'An average learner rating of 4.8 or higher across 10 or more items.'],
]
