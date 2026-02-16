import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { FeatureSlider } from '../components/FeatureSlider'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Brand Visual */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-slate-900 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-primary-950"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Content Overlay */}
        <FeatureSlider className="p-8"/>

      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-4 py-8 sm:p-8 bg-slate-50/50">
        <div className="max-w-[420px] w-full bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 ease-in-out">
          {/* Mobile brand logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-display">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-600 text-base">
              {isSignUp
                ? 'Start building your dream collections in seconds.'
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="input-field"
              />
              {isSignUp && (
                <p className="text-xs text-slate-500 ml-1">
                  Must be at least 6 characters long
                </p>
              )}
            </div>

            <div className={`transition-all duration-300 ease-out overflow-hidden ${error ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium">{error}</p>
                      <p className="text-red-500 text-xs mt-1">
                        {error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credentials')
                          ? 'Double-check your email and password, then try again.'
                          : error.toLowerCase().includes('already')
                          ? 'Try signing in instead, or use a different email.'
                          : 'Please try again. If the problem persists, try a different browser.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="ml-2 text-primary-600 hover:text-primary-700 hover:underline hover:underline-offset-2 transition-all"
              >
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
