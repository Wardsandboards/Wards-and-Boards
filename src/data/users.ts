import type { User } from '../types'

export const DEMO_USERS: Record<string, User> = {
  'sam@med.school': { name: 'Sam (student)', email: 'sam@med.school', role: 'learner', app: { status: 'none' } },
  'rivera@stanford.edu': { name: 'Dr. Rivera', email: 'rivera@stanford.edu', role: 'contributor', app: { status: 'approved', training: 'Cardiology fellow', institution: 'Stanford' } },
  'chen@stanford.edu': { name: 'Dr. Chen', email: 'chen@stanford.edu', role: 'contributor', app: { status: 'approved', training: 'IM resident (PGY-3)', institution: 'Stanford' } },
  'okafor@uci.edu': { name: 'Dr. Okafor', email: 'okafor@uci.edu', role: 'contributor', app: { status: 'approved', training: 'Hospitalist', institution: 'UC Irvine' } },
  'aaron@stanford.edu': { name: 'Aaron Frank, MD', email: 'aaron@stanford.edu', role: 'contributor', app: { status: 'approved', training: 'Hospitalist', institution: 'Stanford' } },
}
