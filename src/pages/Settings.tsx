import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'

export function Settings() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notificationPrefs, setNotificationPrefs] = useState({
    priceAlerts: true,
    availabilityAlerts: true,
    emailDigest: true,
  })
  const [displayPrefs, setDisplayPrefs] = useState({
    theme: 'auto' as 'auto' | 'light' | 'dark',
    density: 'comfortable' as 'comfortable' | 'compact',
    defaultView: 'grid' as 'grid' | 'list',
  })
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    // Simulate loading preferences from storage/API
    const prefs = localStorage.getItem('userPreferences')
    if (prefs) {
      const parsed = JSON.parse(prefs)
      if (parsed.notifications) setNotificationPrefs(parsed.notifications)
      if (parsed.display) setDisplayPrefs(parsed.display)
    }
    setLoading(false)
  }, [])

  const handleNotificationChange = (key: keyof typeof notificationPrefs) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] }
    setNotificationPrefs(updated)
    localStorage.setItem('userPreferences', JSON.stringify({
      notifications: updated,
      display: displayPrefs,
    }))
  }

  const handleDisplayChange = (key: keyof typeof displayPrefs, value: string) => {
    const updated = { ...displayPrefs, [key]: value }
    setDisplayPrefs(updated)
    localStorage.setItem('userPreferences', JSON.stringify({
      notifications: notificationPrefs,
      display: updated,
    }))
  }

  const handleExportData = () => {
    const data = {
      user,
      preferences: {
        notifications: notificationPrefs,
        display: displayPrefs,
      },
      exportedAt: new Date().toISOString(),
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wishlist-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    // In a real app, this would call an API to delete the account
    console.log('Account deletion initiated')
    await signOut()
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage preferences, alerts, and account options."
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Settings' },
        ]}
        actions={(
          <>
            <Link to="/dashboard" className="btn-secondary text-sm">
              Back to Dashboard
            </Link>
            <Link to="/notifications" className="btn-ghost text-sm">
              Notification Center
            </Link>
          </>
        )}
      />

      {/* Profile Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
        <p className="mt-1 text-slate-600">Manage your account information</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Email</label>
            <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900">
              {user?.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">User ID</label>
            <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-600">
              {user?.id}
            </p>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        <p className="mt-1 text-slate-600">Control how you receive updates</p>

        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.priceAlerts}
              onChange={() => handleNotificationChange('priceAlerts')}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0"
            />
            <div>
              <p className="font-semibold text-slate-900">Price Alerts</p>
              <p className="text-sm text-slate-600">Get notified when prices change on your items</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.availabilityAlerts}
              onChange={() => handleNotificationChange('availabilityAlerts')}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0"
            />
            <div>
              <p className="font-semibold text-slate-900">Availability Alerts</p>
              <p className="text-sm text-slate-600">Get notified when items are back in stock</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationPrefs.emailDigest}
              onChange={() => handleNotificationChange('emailDigest')}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0"
            />
            <div>
              <p className="font-semibold text-slate-900">Email Digest</p>
              <p className="text-sm text-slate-600">Receive a weekly summary of your tracked items</p>
            </div>
          </label>
        </div>
      </section>

      {/* Display Preferences */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Display</h2>
        <p className="mt-1 text-slate-600">Customize your viewing experience</p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Theme</label>
            <div className="flex gap-3">
              {['auto', 'light', 'dark'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={option}
                    checked={displayPrefs.theme === option}
                    onChange={() => handleDisplayChange('theme', option)}
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Density</label>
            <div className="flex gap-3">
              {['comfortable', 'compact'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="density"
                    value={option}
                    checked={displayPrefs.density === option}
                    onChange={() => handleDisplayChange('density', option)}
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Default View</label>
            <div className="flex gap-3">
              {['grid', 'list'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="defaultView"
                    value={option}
                    checked={displayPrefs.defaultView === option}
                    onChange={() => handleDisplayChange('defaultView', option)}
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm font-medium text-slate-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Data & Export</h2>
        <p className="mt-1 text-slate-600">Manage your data and preferences</p>

        <div className="mt-6">
          <button
            onClick={handleExportData}
            className="btn-secondary"
          >
            Export Your Data
          </button>
          <p className="mt-2 text-sm text-slate-600">
            Download your collections, items, and preferences as JSON
          </p>
        </div>
      </section>

      {/* Account Management */}
      <section className="rounded-2xl border border-red-200/80 bg-red-50 p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-red-900">Account Management</h2>
        <p className="mt-1 text-red-700">Dangerous zone - proceed with caution</p>

        <div className="mt-6">
          <button
            onClick={handleDeleteAccount}
            className={`${
              deleteConfirm
                ? 'btn-destructive'
                : 'btn-ghost text-red-600 hover:bg-red-100 hover:text-red-700'
            }`}
          >
            {deleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
          </button>
          <p className="mt-2 text-sm text-red-700">
            {deleteConfirm
              ? 'This action cannot be undone. All your data will be permanently deleted.'
              : 'Permanently delete your account and all associated data'}
          </p>
        </div>
      </section>

      {/* App Info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">About</h2>
        <p className="mt-1 text-slate-600">Application information</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">App Version</span>
            <span className="text-sm font-medium text-slate-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Built with</span>
            <span className="text-sm font-medium text-slate-900">React 19 + TypeScript</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Documentation</span>
            <a
              href="#"
              className="text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              View Docs
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Support</span>
            <a
              href="#"
              className="text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
