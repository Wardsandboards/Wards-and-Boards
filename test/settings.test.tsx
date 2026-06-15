import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsView } from '../src/components/settings'

describe('SettingsView', () => {
  it('saves the edited display name, bio, and course code', () => {
    const onSave = vi.fn()
    render(<SettingsView fallbackName="Sam" email="sam@med.school" displayName="" bio="" courseCode="" onSave={onSave} />)
    fireEvent.change(screen.getByPlaceholderText(/How your name appears|Sam/), { target: { value: 'Sam P.' } })
    fireEvent.change(screen.getByPlaceholderText(/sentence or two/), { target: { value: 'MS1 at State.' } })
    fireEvent.change(screen.getByPlaceholderText(/instructor gave you one/), { target: { value: 'IM-301' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(onSave).toHaveBeenCalledWith({ display_name: 'Sam P.', bio: 'MS1 at State.', course_code: 'IM-301' })
  })

  it('falls back to the Google name in the avatar/header when no display name is set', () => {
    render(<SettingsView fallbackName="Sam Jones" email="sam@med.school" displayName="" bio="" courseCode="" onSave={() => {}} />)
    expect(screen.getByText('Sam Jones')).toBeTruthy()
  })
})
