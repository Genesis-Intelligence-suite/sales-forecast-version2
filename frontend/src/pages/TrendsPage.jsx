import { useState, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Brush,
} from 'recharts'
import { useSalesData } from '../context/SalesDataContext'
import { useDerivedSales } from '../hooks/useDerivedSales'
import { ChartCard } from '../components/ui/Cards'
import { formatMoney } from '../utils/format'
import { tooltipProps, axisTick } from '../utils/chartTheme'

const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#a855f7', '#ef4444', '#22c55e', '#ec4899', '#06b6d4']

export default function TrendsPage() {
  const { filteredRows, yearFilter } = useSalesData()
  const m = useDerivedSales(filteredRows)
  
  const [brushRange, setBrushRange] = useState(null)

  const brushedRows = useMemo(() => {
    if (!brushRange || !m.salesData.length) return filteredRows
    const { startIndex, endIndex } = brushRange
    const startName = m.salesData[startIndex]?.name
    const endName = m.salesData[endIndex]?.name
    if (!startName || !endName) return filteredRows
    return filteredRows.filter((row) => {
      if (!row.YearMonth) return false
      return row.YearMonth >= startName && row.YearMonth <= endName
    })
  }, [filteredRows, brushRange, m.salesData])

  const mBrushed = useDerivedSales(brushedRows)

  const handleBrushChange = (range) => {
    setBrushRange(range)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Trends & distribution</h1>
        <p className="text-slate-400 mt-1">
          Same breakdowns as the notebook: monthly pattern, yearly totals, categories, customer types, states{yearFilter ? ` · year ${yearFilter}` : ''}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="col-span-1 lg:col-span-2">
          <ChartCard title="Interactive Sales Trend (Zoom & Pan)">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={m.salesData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
                <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 6 }} />
                <Brush dataKey="name" height={30} stroke="#14b8a6" fill="#0f172a" onChange={handleBrushChange} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Average monthly pattern (sum of Total by calendar month)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mBrushed.monthlyData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
              <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total sales per year">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mBrushed.yearlyData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales by product category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={mBrushed.categorySales} dataKey="sales" nameKey="name" outerRadius={100} innerRadius={50} paddingAngle={1}>
                {mBrushed.categorySales.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#0f172a" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer type">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mBrushed.customerTypeSales}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
              <Bar dataKey="sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top states by sales (Σ Total)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mBrushed.stateSales} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" horizontal />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="name" width={56} tick={axisTick} />
              <Tooltip {...tooltipProps} formatter={(v) => formatMoney(v)} />
              <Bar dataKey="sales" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
