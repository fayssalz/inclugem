import React from 'react';
import { Eye, Camera, Tag } from 'lucide-react';

export default function InclusionCard({
  inclusion,
  onSelect,
  isCompared,
  onToggleCompare
}) {
  return (
    <div className="inclusion-card">
      <div className="card-img-wrapper" onClick={() => onSelect(inclusion)} style={{ cursor: 'pointer' }}>
        <img
          src={inclusion.imageUrl || inclusion.thumbUrl}
          alt={inclusion.title || inclusion.description}
          className="card-img"
          loading="lazy"
        />

        <div className="gemtype-tag">
          {inclusion.gemType}
        </div>

        {inclusion.fieldOfView && (
          <div className="fov-badge">
            FOV = {inclusion.fieldOfView}
          </div>
        )}

        <label
          className="compare-checkbox"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onToggleCompare(inclusion)}
          />
          Compare
        </label>
      </div>

      <div className="card-body" onClick={() => onSelect(inclusion)} style={{ cursor: 'pointer' }}>
        <div className="card-taxonomy">
          {inclusion.taxonomy || `Natural • ${inclusion.gemType}`}
        </div>

        <h3 className="card-title">
          {inclusion.title || (inclusion.description ? inclusion.description.substring(0, 75) + '...' : 'Inclusion Specimen')}
        </h3>

        <div className="card-meta">
          <div className="meta-row">
            <span><strong>Origin:</strong> {inclusion.origin || 'Not Specified'}</span>
            <span><strong>Enhancement:</strong> {inclusion.enhancement || 'None'}</span>
          </div>

          <div className="meta-row" style={{ marginTop: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Camera size={12} color="#00e699" /> {inclusion.photographer || 'Lotus Gemology'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold-primary)' }}>
              {inclusion.imageNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
