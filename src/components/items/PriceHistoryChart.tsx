import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Modal } from '../ui'
import { usePriceTracking } from '../../hooks/usePriceTracking'
import type { Item, PriceHistory } from '../../types'

interface PriceHistoryChartProps {
  item: Item
  isOpen: boolean
  onClose: () => void
}

export function PriceHistoryChart({ item, isOpen, onClose }: PriceHistoryChartProps) {
  const { fetchPriceHistory, getPriceSummary } = usePriceTracking()
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchPriceHistory(item.id).then((data) => {
      setHistory(data)
      setLoading(false)
    })
  }, [isOpen, item.id, fetchPriceHistory])

  const summary = getPriceSummary(history)

  const chartData = history.map((h) => ({
    date: new Date(h.checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: h.price,
  }))

  const formatCurrency = (value: number) => {
    return `${item.currency === 'USD' ? '$' : item.currency} ${value.toFixed(2)}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Price History - ${item.title}`} size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-slate-500 font-medium">No price history yet</p>
          <p className="text-sm text-slate-400 mt-1">Use "Check Prices" to start tracking</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard
                label="Current"
                value={formatCurrency(summary.current)}
              />
              <SummaryCard
                label="Lowest"
                value={formatCurrency(summary.lowest)}
                className="text-emerald-600"
              />
              <SummaryCard
                label="Highest"
                value={formatCurrency(summary.highest)}
                className="text-rose-600"
              />
              <SummaryCard
                label="Change"
                value={`${summary.totalChange >= 0 ? '+' : ''}${formatCurrency(summary.totalChange)}`}
                className={summary.totalChange < 0 ? 'text-emerald-600' : summary.totalChange > 0 ? 'text-rose-600' : 'text-slate-600'}
              />
            </div>
          )}

          {/* Chart */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '0.875rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer info */}
          {summary && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{summary.dataPoints} data point{summary.dataPoints !== 1 ? 's' : ''}</span>
              <span>Last checked: {new Date(summary.lastChecked).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function SummaryCard({ label, value, className = 'text-slate-900' }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold ${className}`}>{value}</p>
    </div>
  )
}
