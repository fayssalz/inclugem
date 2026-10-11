import React from 'react';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { GEM_TYPES, ORIGINS, ENHANCEMENTS, LIGHTING_CONDITIONS } from '../data/filterOptions';

export default function SearchFilters({
  filters,
  setFilters,
  onClearFilters,
  activeFilterCount
}) {
  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="hyperion-filter-bar">
      <div className="filter-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <SlidersHorizontal size={18} color="#00e699" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6' }}>
            Hyperion Inclusion Search Filters
          </h2>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="filters-grid">
            {/* Gem Type Dropdown */}
            <div className="filter-group">
              <label htmlFor="filter_gemtype" className="filter-label">Gem Type</label>
              <select
                id="filter_gemtype"
                name="filter[gemtype]"
                className="form-select"
                value={filters.gemtype}
                onChange={(e) => handleChange('gemtype', e.target.value)}
              >
                <option value="">Gem Type (All)</option>
                {GEM_TYPES.map((type, idx) => (
                  <option key={`${type}-${idx}`} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Origin Dropdown */}
            <div className="filter-group">
              <label htmlFor="filter_origin" className="filter-label">Origin</label>
              <select
                id="filter_origin"
                name="filter[origin]"
                className="form-select"
                value={filters.origin}
                onChange={(e) => handleChange('origin', e.target.value)}
              >
                <option value="">Origin (All)</option>
                {ORIGINS.map((orig, idx) => (
                  <option key={`${orig}-${idx}`} value={orig}>
                    {orig}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhancement Dropdown */}
            <div className="filter-group">
              <label htmlFor="filter_enhancement" className="filter-label">Enhancement</label>
              <select
                id="filter_enhancement"
                name="filter[enhancement]"
                className="form-select"
                value={filters.enhancement}
                onChange={(e) => handleChange('enhancement', e.target.value)}
              >
                <option value="">Enhancement (All)</option>
                {ENHANCEMENTS.map((enh, idx) => (
                  <option key={`${enh}-${idx}`} value={enh}>
                    {enh}
                  </option>
                ))}
              </select>
            </div>

            {/* Lighting Condition Dropdown */}
            <div className="filter-group">
              <label htmlFor="filter_lighting" className="filter-label">Lighting Condition</label>
              <select
                id="filter_lighting"
                name="filter[lighting]"
                className="form-select"
                value={filters.lighting}
                onChange={(e) => handleChange('lighting', e.target.value)}
              >
                <option value="">Lighting (All)</option>
                {LIGHTING_CONDITIONS.map((light, idx) => (
                  <option key={`${light}-${idx}`} value={light}>
                    {light}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search Input */}
            <div className="filter-group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="filter_search" className="filter-label">Keyword / Inclusion Feature</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="filter[search]"
                  id="filter_search"
                  value={filters.search}
                  onChange={(e) => handleChange('search', e.target.value)}
                  className="form-control form-input"
                  placeholder="Search by mineral, feature (e.g. three-phase, gota de aceite, rutile), photographer..."
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => handleChange('search', '')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <div className="active-chips">
              {filters.gemtype && (
                <span className="chip">
                  Gem: {filters.gemtype}
                  <button onClick={() => handleChange('gemtype', '')}><X size={12} /></button>
                </span>
              )}
              {filters.origin && (
                <span className="chip">
                  Origin: {filters.origin}
                  <button onClick={() => handleChange('origin', '')}><X size={12} /></button>
                </span>
              )}
              {filters.enhancement && (
                <span className="chip">
                  Enhancement: {filters.enhancement}
                  <button onClick={() => handleChange('enhancement', '')}><X size={12} /></button>
                </span>
              )}
              {filters.lighting && (
                <span className="chip">
                  Light: {filters.lighting}
                  <button onClick={() => handleChange('lighting', '')}><X size={12} /></button>
                </span>
              )}
              {filters.search && (
                <span className="chip">
                  Keyword: "{filters.search}"
                  <button onClick={() => handleChange('search', '')}><X size={12} /></button>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
                <select
                  className="form-select"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                  value={filters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                >
                  <option value="newest">Date (Newest)</option>
                  <option value="oldest">Date (Oldest)</option>
                  <option value="gemType">Gem Type (A-Z)</option>
                  <option value="fovAsc">FOV (Smallest)</option>
                  <option value="fovDesc">FOV (Largest)</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClearFilters}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <RotateCcw size={14} /> Clear ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
