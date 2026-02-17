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
    <div className="min-h-screen flex app-background">
      <div className="hidden lg:flex lg:w-6/12 relative overflow-hidden border-r border-amber-100/80">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700"></div>
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff26_1px,transparent_1px)] [background-size:18px_18px]"></div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-300/25 blur-3xl"></div>
        <div className="absolute -left-16 bottom-4 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl"></div>
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-10">
          <FeatureSlider className="p-0" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Save anywhere</p>
              <p className="mt-1 text-lg font-bold">Cross-site capture</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Track smarter</p>
              <p className="mt-1 text-lg font-bold">Price + stock alerts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-6/12 flex items-center justify-center px-4 py-8 sm:p-8">
        <div className="max-w-[460px] w-full bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-primary-200/40 border border-amber-100 transition-all duration-300 ease-in-out">
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="kicker mb-2">Wishlist Central</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-display">
              {isSignUp ? 'Create your shopping cockpit' : 'Welcome back'}
            </h2>
            <p className="text-slate-600 text-base">
              {isSignUp
                ? 'Organize products from any store and track changes in one calm workspace.'
                : 'Sign in to continue comparing and tracking your saved finds.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-slate-600">No spam</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-slate-600">Fast setup</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-slate-600">Cross-store tracking</span>
          </div>

          <div className="mt-6 pt-6 border-t border-amber-100 text-center">
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
