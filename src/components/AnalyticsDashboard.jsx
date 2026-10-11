import React from 'react';
import { BarChart3, PieChart, MapPin, Sparkles, X } from 'lucide-react';

export default function AnalyticsDashboard({ inclusions, onClose }) {
  // Aggregate statistics
  const gemTypeCounts = {};
  const originCounts = {};
  const enhancementCounts = {};
  const lightingCounts = {};

  inclusions.forEach(inc => {
    const gem = inc.gemType || 'Unknown';
    gemTypeCounts[gem] = (gemTypeCounts[gem] || 0) + 1;

    const orig = inc.origin || 'Not Specified';
    originCounts[orig] = (originCounts[orig] || 0) + 1;

    const enh = inc.enhancement || 'None';
    enhancementCounts[enh] = (enhancementCounts[enh] || 0) + 1;

    const light = inc.lighting || 'Unspecified';
    lightingCounts[light] = (lightingCounts[light] || 0) + 1;
  });

  const getSortedBars = (obj) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  };

  const topGems = getSortedBars(gemTypeCounts);
  const topOrigins = getSortedBars(originCounts);
  const topEnhancements = getSortedBars(enhancementCounts);

  const maxGemCount = topGems[0]?.[1] || 1;
  const maxOrigCount = topOrigins[0]?.[1] || 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '950px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 size={22} color="var(--emerald-primary)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff' }}>
              Gemological Database Analytics & Insights
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Metric Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>{inclusions.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inclusions</div>
            </div>
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--sapphire-primary)' }}>{Object.keys(gemTypeCounts).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gem Types</div>
            </div>
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{Object.keys(originCounts).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Geographic Origins</div>
            </div>
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a855f7' }}>{Object.keys(enhancementCounts).length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enhancements</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Gem Types Chart */}
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={16} color="var(--emerald-primary)" /> Inclusions by Gem Type
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topGems.map(([gem, count]) => (
                  <div key={gem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span>{gem}</span>
                      <span style={{ fontWeight: 600, color: 'var(--emerald-primary)' }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(count / maxGemCount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #059669, #00e699)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Origins Chart */}
            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.2rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--gold-primary)" /> Top Mine & Country Origins
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topOrigins.map(([orig, count]) => (
                  <div key={orig}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span>{orig}</span>
                      <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(count / maxOrigCount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
