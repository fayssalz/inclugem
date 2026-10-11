import React from 'react';
import { X, GitCompare, Camera } from 'lucide-react';

export default function ComparisonModal({
  selectedItems,
  onClose,
  onRemoveItem
}) {
  if (!selectedItems || selectedItems.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '1200px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitCompare size={22} color="var(--emerald-primary)" />
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff' }}>
                Side-by-Side Inclusion Comparator
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Compare optical characteristics, origins, lighting methods, and growth patterns.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="compare-container">
          {selectedItems.map((inc) => (
            <div key={inc.id} className="compare-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="specimen-id">{inc.imageNumber}</span>
                <button
                  onClick={() => onRemoveItem(inc.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ width: '100%', height: '260px', background: '#05080f', borderRadius: '8px', overflow: 'hidden' }}>
                <img
                  src={inc.imageUrl}
                  alt={inc.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#ffffff', marginTop: '0.5rem' }}>
                {inc.title}
              </h4>

              <div className="description-box" style={{ fontSize: '0.82rem', padding: '0.75rem' }}>
                {inc.description}
              </div>

              <table className="detail-table">
                <tbody>
                  <tr>
                    <td>Gem Type:</td>
                    <td><strong style={{ color: 'var(--emerald-primary)' }}>{inc.gemType}</strong></td>
                  </tr>
                  <tr>
                    <td>Origin:</td>
                    <td>{inc.origin || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td>Enhancement:</td>
                    <td>{inc.enhancement}</td>
                  </tr>
                  <tr>
                    <td>Lighting:</td>
                    <td>{inc.lighting}</td>
                  </tr>
                  <tr>
                    <td>FOV:</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{inc.fieldOfView}</td>
                  </tr>
                  <tr>
                    <td>Photographer:</td>
                    <td>{inc.photographer}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
