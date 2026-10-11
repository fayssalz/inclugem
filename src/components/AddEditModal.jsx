import React, { useState, useEffect } from 'react';
import { X, Save, Image, Link, Plus, Trash2, Upload, RefreshCw } from 'lucide-react';
import { GEM_TYPES, ORIGINS, ENHANCEMENTS, LIGHTING_CONDITIONS } from '../data/filterOptions';
import { getImgBBApiKey, getCloudflareWorkerUrl, getStorageProvider } from '../utils/storage';
import { uploadToImgBB } from '../utils/imgbb';
import { uploadToCloudflareR2 } from '../utils/cloudflare';

export default function AddEditModal({
  inclusionToEdit,
  onSave,
  onClose
}) {
  const [isUploadingImgBB, setIsUploadingImgBB] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageNumber: '',
    gemType: '',
    taxonomy: '',
    origin: '',
    enhancement: '',
    lighting: 'Dark Field',
    photographer: '',
    fieldOfView: '2.5mm',
    magnification: '40x',
    datePosted: new Date().toISOString().split('T')[0],
    description: '',
    imageUrl: '',
    tagsStr: '',
    refTitle: '',
    refAuthors: '',
    refDetails: '',
    refUrl: ''
  });

  useEffect(() => {
    if (inclusionToEdit) {
      setFormData({
        title: inclusionToEdit.title || '',
        imageNumber: inclusionToEdit.imageNumber || '',
        gemType: inclusionToEdit.gemType || '',
        taxonomy: inclusionToEdit.taxonomy || '',
        origin: inclusionToEdit.origin || '',
        enhancement: inclusionToEdit.enhancement || '',
        lighting: inclusionToEdit.lighting || 'Dark Field',
        photographer: inclusionToEdit.photographer || '',
        fieldOfView: inclusionToEdit.fieldOfView || '',
        magnification: inclusionToEdit.magnification || '',
        datePosted: inclusionToEdit.datePosted || new Date().toISOString().split('T')[0],
        description: inclusionToEdit.description || '',
        imageUrl: inclusionToEdit.imageUrl || '',
        tagsStr: inclusionToEdit.tags ? inclusionToEdit.tags.join(', ') : '',
        refTitle: inclusionToEdit.references?.[0]?.title || '',
        refAuthors: inclusionToEdit.references?.[0]?.authors || '',
        refDetails: inclusionToEdit.references?.[0]?.details || '',
        refUrl: inclusionToEdit.references?.[0]?.url || ''
      });
    }
  }, [inclusionToEdit]);

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        imageUrl: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert('Please provide a Title and Image URL for the inclusion record.');
      return;
    }

    let finalImageUrl = formData.imageUrl;
    let finalThumbUrl = formData.imageUrl;

    // Check if user uploaded a local image (data URL)
    if (formData.imageUrl.startsWith('data:image')) {
      const provider = getStorageProvider();
      const workerUrl = getCloudflareWorkerUrl();
      const apiKey = getImgBBApiKey();

      if (provider === 'cloudflare' || workerUrl || !apiKey) {
        setIsUploadingImgBB(true);
        try {
          const res = await uploadToCloudflareR2(formData.imageUrl, workerUrl);
          finalImageUrl = res.imageUrl;
          finalThumbUrl = res.thumbUrl;
        } catch (cfErr) {
          console.warn('Cloudflare R2 Upload Warning:', cfErr);
          if (apiKey) {
            try {
              const res = await uploadToImgBB(formData.imageUrl, apiKey);
              finalImageUrl = res.imageUrl;
              finalThumbUrl = res.thumbUrl;
            } catch (imgbbErr) {
              alert(`Image upload error: ${cfErr.message}. Storing image locally.`);
            }
          }
        } finally {
          setIsUploadingImgBB(false);
        }
      } else if (apiKey) {
        setIsUploadingImgBB(true);
        try {
          const res = await uploadToImgBB(formData.imageUrl, apiKey);
          finalImageUrl = res.imageUrl;
          finalThumbUrl = res.thumbUrl;
        } catch (err) {
          alert(`ImgBB Upload Error: ${err.message}. Storing image locally.`);
        } finally {
          setIsUploadingImgBB(false);
        }
      }
    }

    const tagsArray = formData.tagsStr
      ? formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const references = formData.refTitle ? [{
      title: formData.refTitle,
      authors: formData.refAuthors,
      details: formData.refDetails,
      url: formData.refUrl
    }] : [];

    const result = {
      id: inclusionToEdit ? inclusionToEdit.id : `inc-${Date.now()}`,
      imageNumber: formData.imageNumber || `IMG-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: formData.title,
      description: formData.description,
      gemType: formData.gemType,
      taxonomy: formData.taxonomy || `Natural • ${formData.gemType}`,
      origin: formData.origin,
      enhancement: formData.enhancement,
      lighting: formData.lighting,
      photographer: formData.photographer || 'Staff Photographer',
      fieldOfView: formData.fieldOfView,
      magnification: formData.magnification,
      datePosted: formData.datePosted,
      imageUrl: finalImageUrl,
      thumbUrl: finalThumbUrl,
      tags: tagsArray,
      references
    };

    onSave(result);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff' }}>
            {inclusionToEdit ? 'Edit Inclusion Record' : 'Add New Photomicrograph Record'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="filter-group">
              <label className="filter-label">Title / Caption Summary *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Three-Phase fluid inclusion in Colombian Emerald"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Image Specimen Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A-005-9185-4"
                value={formData.imageNumber}
                onChange={(e) => setFormData({ ...formData, imageNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="filter-group">
              <label className="filter-label">Gem Type</label>
              <select
                className="form-select"
                value={formData.gemType}
                onChange={(e) => setFormData({ ...formData, gemType: e.target.value })}
              >
                {GEM_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Geographic Origin</label>
              <select
                className="form-select"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              >
                {ORIGINS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Enhancement</label>
              <select
                className="form-select"
                value={formData.enhancement}
                onChange={(e) => setFormData({ ...formData, enhancement: e.target.value })}
              >
                {ENHANCEMENTS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div className="filter-group">
              <label className="filter-label">Lighting Condition</label>
              <select
                className="form-select"
                value={formData.lighting}
                onChange={(e) => setFormData({ ...formData, lighting: e.target.value })}
              >
                {LIGHTING_CONDITIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Field of View (mm)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2.2mm"
                value={formData.fieldOfView}
                onChange={(e) => setFormData({ ...formData, fieldOfView: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Magnification</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10x"
                value={formData.magnification}
                onChange={(e) => setFormData({ ...formData, magnification: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Photographer</label>
              <input
                type="text"
                className="form-input"
                placeholder="Photographer Name"
                value={formData.photographer}
                onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Photomicrograph Image (URL or Local File Upload) *</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                required
                placeholder="https://... or click Upload Image button"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                style={{ flex: 1 }}
              />
              <label
                className="btn btn-secondary"
                style={{
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.85rem'
                }}
              >
                <Upload size={14} /> Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {formData.imageUrl && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0a101d', padding: '0.5rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #334155' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {formData.imageUrl.startsWith('data:image') ? 'Uploaded image ready for database persistence' : 'Image URL set'}
                </div>
              </div>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label">Full Diagnostic Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Detailed description of the inclusion scene..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. three-phase, halite, columbia, dark-field"
              value={formData.tagsStr}
              onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
            />
          </div>

          {/* Reference section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>
              Academic Literature Reference (Optional)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Paper / Book Title"
                value={formData.refTitle}
                onChange={(e) => setFormData({ ...formData, refTitle: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Authors & Year (e.g. Gübelin & Koivula 2008)"
                value={formData.refAuthors}
                onChange={(e) => setFormData({ ...formData, refAuthors: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Journal / Publisher details"
                value={formData.refDetails}
                onChange={(e) => setFormData({ ...formData, refDetails: e.target.value })}
              />
              <input
                type="url"
                className="form-input"
                placeholder="Reference URL"
                value={formData.refUrl}
                onChange={(e) => setFormData({ ...formData, refUrl: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploadingImgBB}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploadingImgBB}>
              {isUploadingImgBB ? (
                <>
                  <RefreshCw size={16} className="spin" /> Uploading to ImgBB...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Inclusion Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
