import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { brandsAPI } from '../lib/api';
import type { BrandProfile, DiscoveryResult, InfluencerMatch } from '../lib/types';

export const InfluencerDiscoveryPage = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [includeMicro, setIncludeMicro] = useState(true);
  const [includeMacro, setIncludeMacro] = useState(true);
  const [includeMega, setIncludeMega] = useState(false);
  const [minSubscribers, setMinSubscribers] = useState<number>(10000);
  const [maxSubscribers, setMaxSubscribers] = useState<number>(1000000);
  const [minEngagementRate, setMinEngagementRate] = useState<number | undefined>(undefined);
  const [minViewRatio, setMinViewRatio] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'micro' | 'macro' | 'mega'>('all');

  useEffect(() => {
    if (brandId) {
      fetchBrandProfile();
    }
  }, [brandId]);

  const fetchBrandProfile = async () => {
    try {
      const data = await brandsAPI.getProfile(parseInt(brandId! ));
      setBrandProfile(data);
    } catch (err) {
      setError('Failed to load brand profile');
    }
  };

  const handleDiscover = async () => {
    if (!brandId) return;

    setDiscovering(true);
    setError('');
    setResult(null);

    try {
      const data = await brandsAPI.discoverInfluencers({
        brand_profile_id: parseInt(brandId),
        search_query: searchQuery || undefined,
        max_results: maxResults,
        include_micro: includeMicro,
        include_macro: includeMacro,
        include_mega: includeMega,
        min_subscribers: minSubscribers,
        max_subscribers: maxSubscribers,
        min_engagement_rate: minEngagementRate,
        min_view_ratio: minViewRatio,
      });
      setResult(data);
    } catch (err:  any) {
      setError(err.response?.data?.detail || 'Discovery failed.  Please try again.');
    } finally {
      setDiscovering(false);
    }
  };

  const getFilteredInfluencers = () => {
    if (!result) return [];
    if (selectedCategory === 'all') return result.recommended_influencers;
    return result.recommended_influencers. filter((inf) => inf.category === selectedCategory);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getToneEmoji = (tone: string) => {
    const tones:  Record<string, string> = {
      aggressive: '🔥',
      friendly: '😊',
      professional: '💼',
      humorous: '😂',
      edgy: '⚡',
      unknown: '❓',
    };
    return tones[tone] || '📝';
  };

  if (! brandProfile) {
    return <div style={styles.loading}>Loading brand profile... </div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/brands')} style={styles.backButton}>
            ← Back to Brands
          </button>
          <h1 style={styles.title}>🔍 Discover Influencers</h1>
          <p style={styles.subtitle}>Brand:  <strong>{brandProfile.name}</strong></p>
        </div>
      </div>

      <div style={styles.searchPanel}>
        <h2 style={styles.panelTitle}>Search Configuration</h2>

        <div style={styles.field}>
          <label style={styles.label}>Search Query (optional)</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.input}
            placeholder="e.g., gaming tech review, comedy vlog"
            disabled={discovering}
          />
          <small style={styles.hint}>
            Leave empty to use brand's preferred categories:  {brandProfile.preferred_categories. join(', ') || 'None'}
          </small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Max Results</label>
          <input
            type="number"
            value={maxResults}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setMaxResults(val);
            }}
            style={{ ...styles.input, width: '150px' }}
            min="5"
            max="50"
            disabled={discovering}
          />
        </div>

        <div style={styles.advancedToggle}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={styles.toggleButton}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Filters
          </button>
        </div>

        {showAdvanced && (
          <div style={styles.advancedSection}>
            <h3 style={styles.advancedTitle}>📊 Custom Metrics</h3>
            
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Min Subscribers</label>
                <input
                  type="number"
                  value={minSubscribers}
                  onChange={(e) => setMinSubscribers(parseInt(e.target.value) || 0)}
                  style={styles.input}
                  placeholder="e.g., 10000"
                  disabled={discovering}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Max Subscribers</label>
                <input
                  type="number"
                  value={maxSubscribers}
                  onChange={(e) => setMaxSubscribers(parseInt(e.target.value) || 0)}
                  style={styles.input}
                  placeholder="e.g., 1000000"
                  disabled={discovering}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Min Engagement Rate (%) - Optional</label>
                <input
                  type="number"
                  step="0.1"
                  value={minEngagementRate ?? ''}
                  onChange={(e) => setMinEngagementRate(e.target.value ? parseFloat(e.target.value) : undefined)}
                  style={styles.input}
                  placeholder="e.g., 2.0"
                  disabled={discovering}
                />
                <small style={styles.hint}>Leave empty for no filter</small>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Min View/Sub Ratio (%) - Optional</label>
                <input
                  type="number"
                  step="0.1"
                  value={minViewRatio ?? ''}
                  onChange={(e) => setMinViewRatio(e.target.value ? parseFloat(e.target.value) : undefined)}
                  style={styles.input}
                  placeholder="e.g., 3.0"
                  disabled={discovering}
                />
                <small style={styles.hint}>Higher = better video performance</small>
              </div>
            </div>
          </div>
        )}

        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeMicro}
              onChange={(e) => setIncludeMicro(e.target. checked)}
              disabled={discovering}
              style={styles.checkbox}
            />
            Micro (10K-100K followers)
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeMacro}
              onChange={(e) => setIncludeMacro(e. target.checked)}
              disabled={discovering}
              style={styles. checkbox}
            />
            Macro (100K-1M followers)
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeMega}
              onChange={(e) => setIncludeMega(e.target.checked)}
              disabled={discovering}
              style={styles.checkbox}
            />
            Mega (1M+ followers)
          </label>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={handleDiscover}
          disabled={discovering || (! includeMicro && !includeMacro && !includeMega)}
          style={styles.discoverButton}
        >
          {discovering ? '🔄 Analyzing with AI.. .' : '✨ Start Discovery'}
        </button>

        {discovering && (
          <div style={styles.progressInfo}>
            <p>⏳ This may take 30-60 seconds...</p>
            <p>🤖 Gemini AI is analyzing content, audience, and brand fit</p>
          </div>
        )}
      </div>

      {result && (
        <>
          {result.recommended_influencers.length === 0 ? (
            <div style={styles.noResults}>
              <h2 style={styles.noResultsTitle}>🔍 No Influencers Found</h2>
              <p style={styles.noResultsText}>
                We couldn't find any influencers matching your criteria. Here are some suggestions:
              </p>
              <ul style={styles.suggestionsList}>
                <li>✅ Try increasing the follower range (e.g., 5K - 500K instead of 50K - 100K)</li>
                <li>✅ Include more categories (Micro, Macro, Mega)</li>
                <li>✅ Use broader search terms (e.g., "tech" instead of "gaming laptop review")</li>
                <li>✅ Try popular categories: "lifestyle", "tech", "gaming", "beauty", "fitness"</li>
                <li>✅ Leave search query empty to use your brand's preferred categories</li>
              </ul>
              <button onClick={handleDiscover} style={styles.retryButton}>
                🔄 Try Again
              </button>
            </div>
          ) : (
            <>
              <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>📊 Discovery Results</h2>
            <div style={styles.stats}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Found</span>
                <span style={styles.statValue}>{result. recommended_influencers.length}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Estimated Budget</span>
                <span style={styles.statValue}>${result.total_budget.toLocaleString()}</span>
              </div>
              <div style={styles. statItem}>
                <span style={styles.statLabel}>Expected ROI</span>
                <span style={{ ...styles.statValue, color: getScoreColor(result.expected_total_roi) }}>
                  {result.expected_total_roi.toFixed(1)}%
                </span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Total Reach</span>
                <span style={styles.statValue}>{result.expected_total_reach.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={styles. breakdown}>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>🎯 Avg Match Score</span>
              <span style={styles.breakdownValue}>{result.breakdown.avg_match_score.toFixed(1)}%</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>📊 Micro</span>
              <span style={styles.breakdownValue}>{result.breakdown.micro_count}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>📈 Macro</span>
              <span style={styles.breakdownValue}>{result.breakdown.macro_count}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>🚀 Mega</span>
              <span style={styles.breakdownValue}>{result.breakdown. mega_count}</span>
            </div>
          </div>

          <div style={styles. strategyPanel}>
            <h3 style={styles.strategyTitle}>🎯 AI Campaign Strategy</h3>
            <div style={styles.strategyContent}>
              {result.campaign_strategy.split('\n').map((line, i) => (
                <p key={i} style={styles. strategyLine}>{line}</p>
              ))}
            </div>
          </div>

          <div style={styles.filterButtons}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{ ...styles.filterButton, ...(selectedCategory === 'all' ?  styles.filterActive : {}) }}
            >
              All ({result.recommended_influencers. length})
            </button>
            <button
              onClick={() => setSelectedCategory('micro')}
              style={{ ...styles.filterButton, ...(selectedCategory === 'micro' ? styles.filterActive :  {}) }}
            >
              Micro ({result.breakdown.micro_count})
            </button>
            <button
              onClick={() => setSelectedCategory('macro')}
              style={{ ...styles.filterButton, ...(selectedCategory === 'macro' ? styles. filterActive : {}) }}
            >
              Macro ({result. breakdown.macro_count})
            </button>
            <button
              onClick={() => setSelectedCategory('mega')}
              style={{ ... styles.filterButton, ...(selectedCategory === 'mega' ? styles.filterActive : {}) }}
            >
              Mega ({result.breakdown.mega_count})
            </button>
          </div>

          <div style={styles.influencerGrid}>
            {getFilteredInfluencers().map((influencer, index) => (
              <div key={influencer.influencer_id} style={styles. influencerCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.rank}>#{index + 1}</div>
                  <div style={styles.categoryBadge}>
                    {influencer.category.toUpperCase()}
                  </div>
                </div>

                <h3 style={styles.influencerName}>{influencer.display_name}</h3>
                <p style={styles.influencerUsername}>@{influencer.username}</p>

                <div style={styles.mainScore}>
                  <div style={styles.scoreCircle}>
                    <svg width="80" height="80">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke={getScoreColor(influencer. overall_match_score)}
                        strokeWidth="8"
                        strokeDasharray={`${influencer.overall_match_score * 2.2} ${220 - influencer.overall_match_score * 2.2}`}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                      />
                      <text
                        x="40"
                        y="45"
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="bold"
                        fill={getScoreColor(influencer.overall_match_score)}
                      >
                        {influencer.overall_match_score.toFixed(0)}
                      </text>
                    </svg>
                  </div>
                  <div style={styles. scoreLabel}>Match Score</div>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>👥 Followers</span>
                    <span style={styles. metricValue}>{influencer. followers_count. toLocaleString()}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>💰 Est. Cost</span>
                    <span style={styles.metricValue}>${influencer.estimated_cost. toLocaleString()}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>📈 Est. ROI</span>
                    <span style={{ ...styles. metricValue, color: getScoreColor(influencer.estimated_roi) }}>
                      {influencer.estimated_roi.toFixed(1)}%
                    </span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>🔥 Engagement</span>
                    <span style={styles.metricValue}>{influencer.engagement_rate. toFixed(2)}%</span>
                  </div>
                </div>

                <div style={styles. subScores}>
                  <div style={styles.subScore}>
                    <div style={styles.subScoreBar}>
                      <div
                        style={{
                          ... styles.subScoreFill,
                          width: `${influencer.content_style_match}%`,
                          background: getScoreColor(influencer.content_style_match),
                        }}
                      />
                    </div>
                    <span style={styles.subScoreLabel}>Content Style</span>
                    <span style={styles.subScoreValue}>{influencer.content_style_match.toFixed(0)}%</span>
                  </div>
                  <div style={styles.subScore}>
                    <div style={styles. subScoreBar}>
                      <div
                        style={{
                          ...styles.subScoreFill,
                          width:  `${influencer.audience_match}%`,
                          background: getScoreColor(influencer.audience_match),
                        }}
                      />
                    </div>
                    <span style={styles.subScoreLabel}>Audience Match</span>
                    <span style={styles.subScoreValue}>{influencer.audience_match.toFixed(0)}%</span>
                  </div>
                  <div style={styles.subScore}>
                    <div style={styles.subScoreBar}>
                      <div
                        style={{
                          ... styles.subScoreFill,
                          width: `${influencer.engagement_quality}%`,
                          background: getScoreColor(influencer. engagement_quality),
                        }}
                      />
                    </div>
                    <span style={styles.subScoreLabel}>Engagement Quality</span>
                    <span style={styles.subScoreValue}>{influencer. engagement_quality.toFixed(0)}%</span>
                  </div>
                </div>

                <div style={styles.tone}>
                  <span style={styles.toneEmoji}>{getToneEmoji(influencer.content_tone)}</span>
                  <span style={styles.toneText}>{influencer.content_tone}</span>
                </div>

                <div style={styles. aiSummary}>
                  <strong>🤖 AI Analysis: </strong>
                  <p style={styles.summaryText}>{influencer.ai_summary}</p>
                </div>
              </div>
            ))}
          </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth:  '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  header:  {
    marginBottom: '2rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    background: '#e0e0e0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2.5rem',
    color: '#333',
  },
  subtitle: {
    margin:  0,
    fontSize: '1rem',
    color: '#666',
  },
  searchPanel:  {
    background: 'white',
    padding: '2rem',
    borderRadius:  '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  panelTitle:  {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#333',
  },
  field: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
  },
  hint: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#999',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  discoverButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  progressInfo: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f0f9ff',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  resultsHeader: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  },
  resultsTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.75rem',
    color: '#333',
  },
  stats:  {
    display: 'grid',
    gridTemplateColumns:  'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1.5rem',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  breakdown: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  breakdownItem: {
    flex: 1,
    minWidth: '150px',
    padding: '1rem',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  breakdownLabel: {
    display:  'block',
    fontSize:  '0.85rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  breakdownValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#667eea',
  },
  strategyPanel: {
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    padding: '2rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    border: '2px solid #667eea30',
  },
  strategyTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    color: '#333',
  },
  strategyContent: {
    fontSize: '1rem',
    lineHeight: '1.8',
    color: '#444',
  },
  strategyLine: {
    margin: '0.5rem 0',
  },
  filterButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  filterButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  filterActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  influencerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
  },
  influencerCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent:  'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  rank:  {
    fontSize: '1.5rem',
    fontWeight:  'bold',
    color: '#667eea',
  },
  categoryBadge: {
    padding: '0.25rem 0.75rem',
    background: '#f0f0f0',
    borderRadius:  '20px',
    fontSize:  '0.75rem',
    fontWeight: '700',
    color: '#666',
  },
  influencerName: {
    margin:  '0 0 0.25rem 0',
    fontSize:  '1.25rem',
    color: '#333',
  },
  influencerUsername: {
    margin: '0 0 1. 5rem 0',
    fontSize: '0.9rem',
    color: '#999',
  },
  mainScore: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  scoreCircle: {
    marginBottom: '0.5rem',
  },
  scoreLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '600',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns:  '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#f9f9f9',
    borderRadius: '10px',
  },
  metricItem: {
    display:  'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  metricLabel: {
    fontSize:  '0.8rem',
    color: '#666',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
  },
  subScores: {
    display:  'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  subScore: {
    display: 'grid',
    gridTemplateColumns:  '1fr auto auto',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subScoreBar: {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  subScoreFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  subScoreLabel: {
    fontSize: '0.8rem',
    color: '#666',
  },
  subScoreValue: {
    fontSize:  '0.85rem',
    fontWeight: 'bold',
    color: '#333',
    width: '40px',
    textAlign: 'right' as const,
  },
  tone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#f0f0f0',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  toneEmoji: {
    fontSize:  '1.5rem',
  },
  toneText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize' as const,
  },
  aiSummary: {
    padding: '1rem',
    background: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#333',
  },
  summaryText: {
    margin: '0.5rem 0 0 0',
  },
  noResults: {
    background: 'white',
    padding: '3rem',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  noResultsTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.75rem',
    color: '#333',
  },
  noResultsText: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.1rem',
    color: '#666',
  },
  suggestionsList: {
    textAlign: 'left' as const,
    maxWidth: '600px',
    margin: '0 auto 2rem auto',
    listStyle: 'none',
    padding: 0,
  },
  retryButton: {
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  advancedToggle: {
    marginBottom: '1rem',
  },
  toggleButton: {
    padding: '0.5rem 1rem',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#555',
  },
  advancedSection: {
    background: '#f9f9f9',
    padding: '1.5rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    border: '1px solid #e0e0e0',
  },
  advancedTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    color: '#333',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
};