import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function mockBaseAuthState() {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any)
    return { supabase }
  }

  it('should return null user when not authenticated', async () => {
    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    })
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  it('should return user when authenticated', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const { supabase } = await import('../lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          refresh_token: 'refresh',
        }
      },
      error: null,
    })
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      })
      expect(result.current.loading).toBe(false)
    })
  })

  it('should sign in with email and password', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const { supabase } = await mockBaseAuthState()
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: mockUser,
        session: {
          user: mockUser,
          access_token: 'token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          refresh_token: 'refresh',
        }
      },
      error: null,
    })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const response = await result.current.signIn('test@example.com', 'password')

    expect(response.error).toBeNull()
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('should handle sign in error', async () => {
    const { supabase } = await mockBaseAuthState()
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials', name: 'AuthError', status: 400 },
    })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const response = await result.current.signIn('test@example.com', 'wrong')

    expect(response.error).toEqual({ message: 'Invalid credentials', name: 'AuthError', status: 400 })
  })

  it('should sign out', async () => {
    const { supabase } = await mockBaseAuthState()
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await result.current.signOut()

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })
})
