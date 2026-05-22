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
    <div className="panel p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Analytics Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e2a26" />
          <XAxis
            dataKey="date"
            stroke="#5a5450"
            tick={{ fill: '#7a716c' }}
            tickFormatter={(date) => {
              try {
                return format(new Date(date), 'MMM dd');
              } catch {
                return date;
              }
            }}
          />
          <YAxis
            stroke="#5a5450"
            tick={{ fill: '#7a716c' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#242018',
              border: '1px solid #2e2a26',
              borderRadius: '2px',
              color: '#f5f0e8'
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
              color: '#c5bfb8'
            }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#c4a882"
            strokeWidth={2}
            name="Visitors"
            dot={{ fill: '#c4a882', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="mosaics"
            stroke="#d4b892"
            strokeWidth={2}
            name="Mosaics"
            dot={{ fill: '#d4b892', strokeWidth: 2, r: 4 }}
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
