import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService, type AnalyticsMetrics, type AnalyticsSummary } from '../services/analytics';
import { feedbackService, type FeedbackStats, type RecentFeedbackItem } from '../services/feedback';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { FeedbackOverview } from '../components/dashboard/FeedbackOverview';
import { BarChart3, Download, Users, Image, LogOut, RefreshCw, TrendingUp, MessageSquare, ArrowLeft } from 'lucide-react';

const FEEDBACK_LIMIT = 100;

type Tab = 'overview' | 'feedback';

export function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'feedback' ? 'feedback' : 'overview';
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
        feedbackService.getRecent(FEEDBACK_LIMIT, false, days)
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

  const tabs: { id: Tab; label: string; icon: JSX.Element; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" strokeWidth={1.5} /> },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageSquare className="w-4 h-4" strokeWidth={1.5} />,
      badge: feedbackStats?.total,
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header: same bar as the public app */}
      <header style={{ borderBottom: '1px solid #2e2a26', height: '52px' }}
              className="flex items-center justify-between px-4 sm:px-7">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-serif text-text-primary" style={{ fontSize: '17px' }}>Mosaic Me</span>
          <span className="chip-label" style={{ marginBottom: 0 }}>Admin</span>
        </div>
        <div className="flex items-center gap-5" style={{ fontSize: '12px' }}>
          <span className="hidden sm:inline text-text-muted truncate">{admin?.email}</span>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            App
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-text-muted hover:text-error-light transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="font-serif text-text-primary mb-6" style={{ fontSize: '28px' }}>Dashboard</h1>

        {/* Tabs and controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-border">
          <div className="flex gap-1" role="tablist">
            {tabs.map(({ id, label, icon, badge }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setSearchParams(id === 'overview' ? {} : { tab: id })}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors ${
                  tab === id
                    ? 'border-accent text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {icon}
                {label}
                {badge !== undefined && badge > 0 && (
                  <span className="text-xs text-text-muted">{badge}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <select
              aria-label="Time period"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 text-sm bg-surface border border-border rounded-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={() => loadAnalytics(true)}
              disabled={isLoading}
              aria-label="Refresh"
              title="Refresh"
              className="p-2.5 bg-surface border border-border hover:border-accent text-text-secondary rounded-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
            {tab === 'overview' && (
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-accent hover:bg-accent-hover text-bg rounded-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                <span>{isExporting ? 'Exporting…' : 'Export CSV'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div role="alert" className="mb-6 border border-error/50 bg-error/10 p-4 text-sm text-error-light rounded-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && !metrics ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : metrics && tab === 'feedback' ? (
          <FeedbackOverview stats={feedbackStats} feedback={recentFeedback} days={days} limit={FEEDBACK_LIMIT} />
        ) : metrics ? (
          <div className="space-y-6">
            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Unique Visitors"
                value={metrics.unique_visitors}
                icon={<Users className="w-5 h-5" strokeWidth={1.5} />}
                description={`Last ${days} days`}
              />
              <MetricsCard
                title="Mosaics Created"
                value={metrics.mosaics_created}
                icon={<Image className="w-5 h-5" strokeWidth={1.5} />}
                description={`Last ${days} days`}
              />
              <MetricsCard
                title="Total Downloads"
                value={metrics.downloads.total}
                icon={<Download className="w-5 h-5" strokeWidth={1.5} />}
                description={`${metrics.mosaics_created > 0
                  ? ((metrics.downloads.total / metrics.mosaics_created) * 100).toFixed(1)
                  : '0'}% of mosaics downloaded`}
              />
              <MetricsCard
                title="Satisfaction"
                value={feedbackStats && feedbackStats.total > 0 ? `${feedbackStats.satisfaction_rate}%` : '—'}
                icon={<TrendingUp className="w-5 h-5" strokeWidth={1.5} />}
                description={`${feedbackStats?.total ?? 0} ratings · ${feedbackStats?.with_comment ?? 0} suggestions`}
              />
            </div>

            {/* Download breakdown */}
            <div className="panel grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {[
                ['Mosaic PNG', metrics.downloads.mosaic_png],
                ['Instructions PNG', metrics.downloads.instructions_png],
                ['Shopping CSV', metrics.downloads.shopping_csv],
              ].map(([label, value]) => (
                <div key={label} className="p-4">
                  <p className="chip-label">{label}</p>
                  <p className="text-xl font-medium text-text-primary mt-1">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {summary.length > 0 && (
              <AnalyticsChart data={summary} />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
