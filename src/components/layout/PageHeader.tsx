import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface PageHeaderCrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  breadcrumbs?: PageHeaderCrumb[]
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-primary-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{eyebrow}</p>
          )}
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-slate-600">{description}</p>}
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}
