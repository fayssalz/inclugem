import React, { useState, useRef } from 'react';
import { Microscope, PlusCircle, Download, Upload, BarChart3, RefreshCw, GitCompare, Globe, Database, Settings, Cloud } from 'lucide-react';
import { exportToJSON, exportToCSV, importFromJSONFile } from '../utils/exportImport';

export default function Header({
  totalCount,
  filteredCount,
  onAddClick,
  onImportSuccess,
  onResetDatabase,
  showAnalytics,
  setShowAnalytics,
  selectedForCompare,
  onOpenCompare,
  searchMode,
  setSearchMode,
  onOpenSettings,
  storageProvider
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedData = await importFromJSONFile(file);
      onImportSuccess(importedData);
      alert(`Successfully imported ${importedData.length} inclusion records!`);
    } catch (err) {
      alert(`Import error: ${err.message}`);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-badge">
            <Microscope size={24} />
          </div>
          <div>
            <div className="logo-title">Hyperion Inclusions DB</div>
            <div className="logo-subtitle">
              {searchMode === 'live'
                ? '🌐 Live Lotus Gemology Search'
                : storageProvider === 'sheet'
                  ? '📊 Google Sheets Cloud Database'
                  : '💾 Local Gemological Database'
              }
            </div>
          </div>
        </div>

        {/* Mode Switcher Pills */}
        <div style={{ display: 'flex', background: '#111827', border: '1px solid #26334d', borderRadius: '8px', padding: '3px' }}>
          <button
            className={`btn ${searchMode === 'live' ? 'btn-primary' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              background: searchMode === 'live' ? 'linear-gradient(135deg, #059669, #00e699)' : 'transparent',
              color: searchMode === 'live' ? '#04121e' : '#9ca3af',
              border: 'none'
            }}
            onClick={() => setSearchMode('live')}
            title="Perform live queries directly against Lotus Gemology's Hyperion Search Engine"
          >
            <Globe size={14} /> Live Hyperion Search
          </button>

          <button
            className={`btn ${searchMode === 'local' ? 'btn-primary' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              background: searchMode === 'local' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
              color: searchMode === 'local' ? '#ffffff' : '#9ca3af',
              border: 'none'
            }}
            onClick={() => setSearchMode('local')}
            title="Browse your saved database collection"
          >
            <Database size={14} /> {storageProvider === 'sheet' ? 'Google Sheets DB' : 'My Saved DB'}
          </button>
        </div>

        <div className="header-actions">
          {selectedForCompare.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={onOpenCompare}
              title="Compare selected inclusion specimens side-by-side"
            >
              <GitCompare size={16} />
              Compare ({selectedForCompare.length})
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onOpenSettings}
            title="Cloud & Integrations Settings (Google Sheets & ImgBB)"
            style={{ position: 'relative' }}
          >
            <Cloud size={16} style={{ color: storageProvider === 'sheet' ? '#10b981' : '#94a3b8' }} />
            Cloud API
          </button>

          <button
            className={`btn ${showAnalytics ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAnalytics(!showAnalytics)}
            title="Toggle Analytics Dashboard"
          >
            <BarChart3 size={16} />
            Analytics
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Database Operations (Export/Import)"
            >
              <Download size={16} />
              Database
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#111827',
                  border: '1px solid #26334d',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  width: '180px',
                  padding: '0.4rem'
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    exportToJSON(window.__currentInclusions || []);
                    setShowExportMenu(false);
                  }}
                >
                  <Download size={14} /> Export JSON
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    exportToCSV(window.__currentInclusions || []);
                    setShowExportMenu(false);
                  }}
                >
                  <Download size={14} /> Export CSV
                </button>
                <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0.3rem 0' }} />
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowExportMenu(false);
                  }}
                >
                  <Upload size={14} /> Import JSON
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    if (confirm('Reset database to default seed inclusions?')) {
                      onResetDatabase();
                    }
                    setShowExportMenu(false);
                  }}
                >
                  <RefreshCw size={14} /> Reset Data
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button className="btn btn-primary" onClick={onAddClick}>
            <PlusCircle size={16} />
            Add Inclusion
          </button>
        </div>
      </div>
    </header>
  );
}
