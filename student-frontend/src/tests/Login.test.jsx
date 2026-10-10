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

describe('Student Login page (component tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    render(<Login />)
  })

  it('W-S01: renders heading, registration input, password input and Sign in button', () => {
    expect(screen.getByText('Ruhuna EngRMS')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('EG/XXXX/XXXX')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('W-S02: password is hidden by default and the eye button reveals it', () => {
    const passwordInput = screen.getByPlaceholderText('••••••••')
    expect(passwordInput).toHaveAttribute('type', 'password')

    // The eye toggle is the only type="button" in the form
    const toggle = document.querySelector('button[type="button"]')
    fireEvent.click(toggle)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('W-S03: successful login stores the token and navigates to /dashboard', async () => {
    axios.post.mockResolvedValue({ data: { token: 'tok123', isFirstLogin: false } })

    fireEvent.change(screen.getByPlaceholderText('EG/XXXX/XXXX'), { target: { value: 'EG/2020/123' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
    expect(axios.post).toHaveBeenCalledWith('/api/auth/student/login', {
      regNo: 'EG/2020/123',
      password: 'secret1'
    })
    expect(localStorage.getItem('studentToken')).toBe('tok123')
    expect(toast.success).toHaveBeenCalled()
  })

  it('W-S04: first-time login navigates to /change-password', async () => {
    axios.post.mockResolvedValue({ data: { token: 'tok456', isFirstLogin: true } })

    fireEvent.change(screen.getByPlaceholderText('EG/XXXX/XXXX'), { target: { value: 'EG/2020/999' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/change-password'))
  })

  it('W-S05: failed login shows the backend error message', async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: 'Invalid registration number or password' } }
    })

    fireEvent.change(screen.getByPlaceholderText('EG/XXXX/XXXX'), { target: { value: 'EG/2020/000' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Invalid registration number or password')
    )
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(localStorage.getItem('studentToken')).toBeNull()
  })

  it('W-S06: network failure falls back to "Invalid credentials" message', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'))

    fireEvent.change(screen.getByPlaceholderText('EG/XXXX/XXXX'), { target: { value: 'EG/2020/123' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invalid credentials'))
  })
})
