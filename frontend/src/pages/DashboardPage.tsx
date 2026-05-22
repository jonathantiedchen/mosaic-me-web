import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService, type AnalyticsMetrics, type AnalyticsSummary } from '../services/analytics';
import { feedbackService, type FeedbackStats, type RecentFeedbackItem } from '../services/feedback';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { FeedbackList } from '../components/dashboard/FeedbackList';
import { BarChart3, Download, Users, Image, LogOut, RefreshCw, ThumbsUp, ThumbsDown, TrendingUp, MessageSquare } from 'lucide-react';

export function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async (refreshView: boolean = false) => {
    setIsLoading(true);
    setError('');

    try {
      // Optionally refresh the materialized view first (for latest data)
      if (refreshView) {
        await analyticsService.refreshSummaryView();
      }

      const [metricsData, summaryData, feedbackData, recentFeedbackData] = await Promise.all([
        analyticsService.getMetrics(days),
        analyticsService.getSummary(),
        feedbackService.getStats(days),
        feedbackService.getRecent(20)
      ]);
      setMetrics(metricsData);
      setSummary(summaryData);
      setFeedbackStats(feedbackData);
      setRecentFeedback(recentFeedbackData);
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
    <div className="min-h-screen bg-bg">
      {/* Header */}
        <header className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Analytics Dashboard
                  </h1>
                  <p className="text-sm text-text-secondary mt-1">
                    Welcome back, {admin?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-subtle transition-colors"
                >
                  ← Back to App
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-error/40 hover:border-error text-error-light rounded-sm transition-colors"
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
              <label className="text-sm text-text-secondary">Time period:</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 bg-surface border border-border rounded-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAnalytics(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:border-accent text-text-secondary rounded-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 border border-error/50 bg-error/10 p-4 text-error-light rounded-sm">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && !metrics ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
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
                <div className="panel p-4">
                  <p className="text-sm text-text-secondary mb-1">Instructions PNG</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.downloads.instructions_png.toLocaleString()}
                  </p>
                </div>
                <div className="panel p-4">
                  <p className="text-sm text-text-secondary mb-1">Shopping CSV</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.downloads.shopping_csv.toLocaleString()}
                  </p>
                </div>
                <div className="panel p-4">
                  <p className="text-sm text-text-secondary mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {metrics.mosaics_created > 0
                      ? ((metrics.downloads.total / metrics.mosaics_created) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
              </div>

              {/* Feedback metrics */}
              {feedbackStats && feedbackStats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <MetricsCard
                    title="User Satisfaction"
                    value={`${feedbackStats.satisfaction_rate}%`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    description={`${feedbackStats.total} total responses`}
                  />
                  <MetricsCard
                    title="Positive Feedback"
                    value={feedbackStats.thumbs_up}
                    icon={<ThumbsUp className="w-6 h-6" />}
                    description={`In the last ${days} days`}
                  />
                  <MetricsCard
                    title="Negative Feedback"
                    value={feedbackStats.thumbs_down}
                    icon={<ThumbsDown className="w-6 h-6" />}
                    description={`In the last ${days} days`}
                  />
                </div>
              )}

              {/* Chart */}
              {summary.length > 0 && (
                <AnalyticsChart data={summary} />
              )}

              {/* Recent Feedback */}
              {recentFeedback.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    Recent Feedback
                  </h2>
                  <FeedbackList feedback={recentFeedback} />
                </div>
              )}
            </>
          ) : null}
        </main>
    </div>
  );
}
