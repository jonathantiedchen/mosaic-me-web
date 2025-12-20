import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService, type AnalyticsMetrics, type AnalyticsSummary } from '../services/analytics';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { BarChart3, Download, Users, Image, LogOut, Sparkles, RefreshCw } from 'lucide-react';

export function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [metricsData, summaryData] = await Promise.all([
        analyticsService.getMetrics(days),
        analyticsService.getSummary()
      ]);
      setMetrics(metricsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await analyticsService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export analytics data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-purple-200 mt-1">
                    Welcome back, {admin?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-sm text-purple-300 hover:text-purple-100 transition-colors"
                >
                  ← Back to App
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Time period selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-purple-200">Time period:</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 glass-card border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAnalytics}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-white/10 text-purple-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 glass-card border-red-500/50 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && !metrics ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : metrics ? (
            <>
              {/* Metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                  title="Unique Visitors"
                  value={metrics.unique_visitors}
                  icon={<Users className="w-6 h-6" />}
                  description={`In the last ${days} days`}
                />
                <MetricsCard
                  title="Mosaics Created"
                  value={metrics.mosaics_created}
                  icon={<Image className="w-6 h-6" />}
                  description={`In the last ${days} days`}
                />
                <MetricsCard
                  title="Total Downloads"
                  value={metrics.downloads.total}
                  icon={<Download className="w-6 h-6" />}
                  description={`In the last ${days} days`}
                />
                <MetricsCard
                  title="Mosaic PNGs"
                  value={metrics.downloads.mosaic_png}
                  icon={<BarChart3 className="w-6 h-6" />}
                  description={`In the last ${days} days`}
                />
              </div>

              {/* Download breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-4">
                  <p className="text-sm text-purple-300 mb-1">Instructions PNG</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics.downloads.instructions_png.toLocaleString()}
                  </p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-purple-300 mb-1">Shopping CSV</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics.downloads.shopping_csv.toLocaleString()}
                  </p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-purple-300 mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {metrics.mosaics_created > 0
                      ? ((metrics.downloads.total / metrics.mosaics_created) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>

              {/* Chart */}
              {summary.length > 0 && (
                <AnalyticsChart data={summary} />
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
