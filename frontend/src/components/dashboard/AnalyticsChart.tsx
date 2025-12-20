import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import type { AnalyticsSummary } from '../../types';

interface AnalyticsChartProps {
  data: AnalyticsSummary[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  // Format data for the chart
  const chartData = data.map(item => ({
    date: item.date,
    visitors: item.unique_visitors,
    mosaics: item.mosaics_created,
    downloads: item.total_downloads,
  })).reverse(); // Reverse to show chronological order

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Analytics Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
            tickFormatter={(date) => {
              try {
                return format(new Date(date), 'MMM dd');
              } catch {
                return date;
              }
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: 'rgba(255,255,255,0.6)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelFormatter={(label) => {
              try {
                return format(new Date(label), 'MMMM dd, yyyy');
              } catch {
                return label;
              }
            }}
          />
          <Legend
            wrapperStyle={{
              color: 'rgba(255,255,255,0.8)'
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Visitors"
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="mosaics"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Mosaics"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="downloads"
            stroke="#10b981"
            strokeWidth={2}
            name="Downloads"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
