import { useEffect, useState } from 'react';
import { analyticsAPI } from '../lib/api';
import { StatsCard } from '../components/StatsCard';
import type { DashboardStats } from '../lib/types';

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsAPI.dashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div style={styles.error}>Failed to load dashboard</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <p style={styles.subtitle}>Overview of your influencer campaigns</p>
      </div>

      <div style={styles. statsGrid}>
        <StatsCard
          title="Total Campaigns"
          value={stats.total_campaigns}
          icon="📋"
          color="#667eea"
          subtitle={`${stats.active_campaigns} active`}
        />
        <StatsCard
          title="Total Budget"
          value={`$${stats.total_budget. toLocaleString()}`}
          icon="💰"
          color="#f59e0b"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.total_revenue.toLocaleString()}`}
          icon="💵"
          color="#10b981"
        />
        <StatsCard
          title="Average ROI"
          value={`${stats.avg_roi_percentage.toFixed(1)}%`}
          icon="📈"
          color={stats.avg_roi_percentage > 0 ? '#10b981' : '#ef4444'}
        />
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Performance Metrics</h3>
          <div style={styles.metricList}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>👁️ Total Views</span>
              <span style={styles.metricValue}>{stats.total_views. toLocaleString()}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>👆 Total Clicks</span>
              <span style={styles.metricValue}>{stats.total_clicks.toLocaleString()}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>✅ Total Conversions</span>
              <span style={styles.metricValue}>{stats.total_conversions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={styles.metricCard}>
          <h3 style={styles.metricTitle}>Campaign Status</h3>
          <div style={styles.metricList}>
            <div style={styles. metricItem}>
              <span style={styles.metricLabel}>🟢 Active</span>
              <span style={styles.metricValue}>{stats.active_campaigns}</span>
            </div>
            <div style={styles. metricItem}>
              <span style={styles.metricLabel}>✅ Completed</span>
              <span style={styles.metricValue}>{stats.completed_campaigns}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>💰 Net Profit</span>
              <span style={{ ...styles.metricValue, color: stats.total_roi > 0 ? '#10b981' : '#ef4444' }}>
                ${stats.total_roi.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  error:  {
    textAlign: 'center' as const,
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#ef4444',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2.5rem',
    color: '#333',
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize:  '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  metricsGrid:  {
    display: 'grid',
    gridTemplateColumns:  'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  metricCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  metricTitle: {
    margin: '0 0 1rem 0',
    fontSize:  '1.1rem',
    color: '#333',
  },
  metricList: {
    display: 'flex',
    flexDirection:  'column' as const,
    gap: '1rem',
  },
  metricItem: {
    display:  'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius:  '8px',
  },
  metricLabel: {
    color: '#666',
    fontSize: '0.9rem',
  },
  metricValue: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#333',
  },
};