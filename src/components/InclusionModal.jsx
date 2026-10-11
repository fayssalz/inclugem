import React, { useState } from 'react';
import { X, ExternalLink, Camera, BookOpen, Tag, Trash2, Edit3, Share2, ZoomIn, BookmarkPlus } from 'lucide-react';

export default function InclusionModal({
  inclusion,
  onClose,
  onEdit,
  onDelete,
  onSaveToLocal
}) {
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!inclusion) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="specimen-id">{inclusion.imageNumber || 'ID-UNKNOWN'}</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginTop: '0.25rem', color: '#ffffff' }}>
              {inclusion.title || inclusion.gemType + ' Inclusion'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Lightbox">
            <X size={20} />
          </button>
        </div>

        <div className="modal-grid">
          {/* Left: Photomicrograph Viewer */}
          <div className="modal-image-panel">
            <div style={{ position: 'relative', width: '100%', cursor: 'zoom-in' }} onClick={() => setZoomed(!zoomed)}>
              <img
                src={inclusion.imageUrl}
                alt={inclusion.title}
                className="modal-main-img"
                style={{ transform: zoomed ? 'scale(1.4)' : 'scale(1)', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
              />
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ZoomIn size={14} /> {zoomed ? '140%' : '100%'}
              </div>
            </div>

            {/* Field of View Scale Bar */}
            <div className="scale-bar-container">
              <div className="scale-graphic">
                <div className="scale-line"></div>
                <span style={{ fontSize: '0.78rem', color: 'var(--emerald-primary)', fontFamily: 'var(--font-mono)' }}>
                  Scale: FOV = {inclusion.fieldOfView || 'N/A'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mag: {inclusion.magnification || 'N/A'}
              </div>
            </div>
          </div>

          {/* Right: Gemological Metadata Readout */}
          <div className="modal-info-panel">
            <div className="specimen-badge-row">
              <span className="gemtype-tag" style={{ position: 'static' }}>{inclusion.gemType}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>
                {inclusion.taxonomy || `Natural • ${inclusion.gemType}`}
              </span>
            </div>

            <div className="description-box">
              <p>{inclusion.description}</p>
            </div>

            <table className="detail-table">
              <tbody>
                <tr>
                  <td>Gem Type / Category:</td>
                  <td>{inclusion.gemType}</td>
                </tr>
                <tr>
                  <td>Mine / Geographic Origin:</td>
                  <td>{inclusion.origin || 'Not Determinable'}</td>
                </tr>
                <tr>
                  <td>Enhancement Status:</td>
                  <td>{inclusion.enhancement || 'None Detected (None)'}</td>
                </tr>
                <tr>
                  <td>Lighting Conditions:</td>
                  <td>{inclusion.lighting || 'Fiber Optic / Dark Field'}</td>
                </tr>
                <tr>
                  <td>Photographer:</td>
                  <td>{inclusion.photographer || 'E. Billie Hughes'}</td>
                </tr>
                <tr>
                  <td>Image Specimen No:</td>
                  <td>{inclusion.imageNumber}</td>
                </tr>
                <tr>
                  <td>Field of View:</td>
                  <td>{inclusion.fieldOfView || 'N/A'}</td>
                </tr>
                {inclusion.datePosted && (
                  <tr>
                    <td>Date Posted:</td>
                    <td>{inclusion.datePosted}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Academic Literature References */}
            {inclusion.references && inclusion.references.length > 0 && (
              <div className="references-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                  <BookOpen size={16} color="var(--gold-primary)" />
                  <h4>Literature & Reference Citations</h4>
                </div>
                {inclusion.references.map((ref, idx) => (
                  <div key={idx} className="ref-item">
                    <p style={{ fontWeight: 600, color: '#f3f4f6' }}>{ref.authors} {ref.title}.</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                      {ref.details}
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          View Paper <ExternalLink size={12} />
                        </a>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Chips */}
            {inclusion.tags && inclusion.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <Tag size={14} color="#9ca3af" />
                {inclusion.tags.map((tag, idx) => (
                  <span key={idx} className="chip" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              {onSaveToLocal && inclusion.isLiveLotus && (
                <button className="btn btn-primary" onClick={() => onSaveToLocal(inclusion)} style={{ flex: 1 }}>
                  <BookmarkPlus size={16} /> Save to My DB
                </button>
              )}

              <button className="btn btn-secondary" onClick={handleCopyLink} style={{ flex: 1 }}>
                <Share2 size={16} />
                {copied ? 'Link Copied!' : 'Share Specimen'}
              </button>

              {!inclusion.isLiveLotus && (
                <>
                  <button className="btn btn-secondary" onClick={() => onEdit(inclusion)}>
                    <Edit3 size={16} /> Edit
                  </button>

                  <button className="btn btn-danger" onClick={() => onDelete(inclusion.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
