import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Login from '@/pages/Login'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock('axios', () => ({ default: { post: vi.fn() } }))
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}))
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

const EMAIL_PLACEHOLDER = 'name@eng.ruh.ac.lk'
const PASSWORD_PLACEHOLDER = '••••••••'

function fillCredentials(email, password) {
  fireEvent.change(screen.getByPlaceholderText(EMAIL_PLACEHOLDER), { target: { value: email } })
  fireEvent.change(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER), { target: { value: password } })
}

describe('Admin/Examiner Login page (component tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    render(<Login />)
  })

  it('W-A01: renders heading and the ADMIN / EXAMINER role buttons', () => {
    expect(screen.getByText('Ruhuna EngRMS')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ADMIN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EXAMINER' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('W-A02: successful ADMIN login stores adminToken and navigates to /admin', async () => {
    axios.post.mockResolvedValue({ data: { token: 'adminTok', success: true } })

    fillCredentials('admin@eng.ruh.ac.lk', 'adminpass')
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'))
    expect(axios.post).toHaveBeenCalledWith('/api/auth/admin/login', {
      email: 'admin@eng.ruh.ac.lk',
      password: 'adminpass'
    })
    expect(localStorage.getItem('adminToken')).toBe('adminTok')
  })

  it('W-A03: switching to EXAMINER role logs in via the examiner endpoint', async () => {
    axios.post.mockResolvedValue({ data: { token: 'exTok', success: true } })

    fireEvent.click(screen.getByRole('button', { name: 'EXAMINER' }))
    fillCredentials('examiner@eng.ruh.ac.lk', 'expass')
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/examiner'))
    expect(axios.post).toHaveBeenCalledWith('/api/auth/examiner/login', {
      email: 'examiner@eng.ruh.ac.lk',
      password: 'expass'
    })
    expect(localStorage.getItem('examinerToken')).toBe('exTok')
  })

  it('W-A04: failed ADMIN login shows the backend error message', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Invalid email or password' } } })

    fillCredentials('admin@eng.ruh.ac.lk', 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid email or password'))
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(localStorage.getItem('adminToken')).toBeNull()
  })

  it('W-A05: examiner registration flow calls the register endpoint', async () => {
    axios.post.mockResolvedValue({ data: { success: true, message: 'Account registered successfully. You can now log in.' } })

    fireEvent.click(screen.getByRole('button', { name: 'EXAMINER' }))
    fireEvent.click(screen.getByText(/First time logging in\? Complete Registration/i))

    // The submit button label changes in registration mode
    expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()

    fillCredentials('new.examiner@eng.ruh.ac.lk', 'newpass1')
    fireEvent.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith('/api/auth/examiner/register', {
        email: 'new.examiner@eng.ruh.ac.lk',
        password: 'newpass1'
      })
    )
    expect(toast.success).toHaveBeenCalledWith('Account registered successfully. You can now log in.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
