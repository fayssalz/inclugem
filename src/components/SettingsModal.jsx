import React, { useState } from 'react';
import { X, Save, Key, Database, FileSpreadsheet, Check, Copy, ExternalLink, RefreshCw, Sparkles, Cloud, Server } from 'lucide-react';
import {
  getImgBBApiKey, setImgBBApiKey,
  getGoogleSheetUrl, setGoogleSheetUrl,
  getCloudflareWorkerUrl, setCloudflareWorkerUrl,
  getStorageProvider, setStorageProvider
} from '../utils/storage';
import { GOOGLE_APPS_SCRIPT_CODE, fetchFromGoogleSheet } from '../utils/googleSheets';
import { testCloudflareConnection } from '../utils/cloudflare';

export default function SettingsModal({ onClose, onSettingsSaved }) {
  const [imgbbKey, setImgbbKey] = useState(() => getImgBBApiKey());
  const [sheetUrl, setSheetUrl] = useState(() => getGoogleSheetUrl());
  const [workerUrl, setWorkerUrl] = useState(() => getCloudflareWorkerUrl());
  const [provider, setProvider] = useState(() => getStorageProvider());

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);

  const [testingSheet, setTestingSheet] = useState(false);
  const [sheetStatus, setSheetStatus] = useState(null);

  const [testingCf, setTestingCf] = useState(false);
  const [cfStatus, setCfStatus] = useState(null);

  const SQL_SCHEMA_CODE = `-- D1 Database Schema for Hyperion Gem Inclusions
CREATE TABLE IF NOT EXISTS inclusions (
  id TEXT PRIMARY KEY,
  imageNumber TEXT,
  title TEXT NOT NULL,
  gemType TEXT,
  taxonomy TEXT,
  origin TEXT,
  enhancement TEXT,
  lighting TEXT,
  photographer TEXT,
  fieldOfView TEXT,
  magnification TEXT,
  datePosted TEXT,
  description TEXT,
  imageUrl TEXT NOT NULL,
  thumbUrl TEXT,
  tags TEXT,        -- JSON array string
  references TEXT,  -- JSON array string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopySqlCode = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestGoogleSheet = async () => {
    if (!sheetUrl) {
      setSheetStatus({ success: false, message: 'Please enter your Google Apps Script Web App URL first.' });
      return;
    }
    setTestingSheet(true);
    setSheetStatus(null);
    try {
      const records = await fetchFromGoogleSheet(sheetUrl);
      setSheetStatus({
        success: true,
        message: `Successfully connected! Google Sheet contains ${records.length} inclusion records.`
      });
    } catch (err) {
      setSheetStatus({
        success: false,
        message: `Connection test failed: ${err.message}`
      });
    } finally {
      setTestingSheet(false);
    }
  };

  const handleTestCloudflare = async () => {
    setTestingCf(true);
    setCfStatus(null);
    try {
      const result = await testCloudflareConnection(workerUrl);
      setCfStatus(result);
    } catch (err) {
      setCfStatus({
        success: false,
        message: `Connection test failed: ${err.message}`
      });
    } finally {
      setTestingCf(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setImgBBApiKey(imgbbKey);
    setGoogleSheetUrl(sheetUrl);
    setCloudflareWorkerUrl(workerUrl);
    setStorageProvider(provider);
    alert('Settings saved successfully!');
    if (onSettingsSaved) onSettingsSaved({ imgbbKey, sheetUrl, workerUrl, provider });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={22} style={{ color: 'var(--gold-primary)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#ffffff' }}>
              Database & Storage Engine Settings
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Storage Engine Provider Selection */}
          <div className="filter-group" style={{ background: '#0d1526', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <label className="filter-label" style={{ color: 'var(--gold-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Server size={16} /> Active Primary Database Engine
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.6rem' }}>

              {/* Cloudflare D1 + R2 Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${provider === 'cloudflare' ? '#2563eb' : '#1e293b'}`,
                background: provider === 'cloudflare' ? 'rgba(37, 99, 235, 0.18)' : '#070d19',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="cloudflare"
                  checked={provider === 'cloudflare'}
                  onChange={() => setProvider('cloudflare')}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Cloud size={14} style={{ color: '#3b82f6' }} /> Cloudflare (Default)
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    D1 SQL Database + R2 Image Storage
                  </div>
                </div>
              </label>

              {/* Local Storage Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${provider === 'local' ? '#10b981' : '#1e293b'}`,
                background: provider === 'local' ? 'rgba(16, 185, 129, 0.15)' : '#070d19',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="local"
                  checked={provider === 'local'}
                  onChange={() => setProvider('local')}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6' }}>Browser Storage</div>
                  <div style={{ fontSize: '0.725rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    Fast offline localStorage
                  </div>
                </div>
              </label>

              {/* Google Sheets Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${provider === 'sheet' ? '#f59e0b' : '#1e293b'}`,
                background: provider === 'sheet' ? 'rgba(245, 158, 11, 0.15)' : '#070d19',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="provider"
                  value="sheet"
                  checked={provider === 'sheet'}
                  onChange={() => setProvider('sheet')}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f3f4f6' }}>Google Sheets</div>
                  <div style={{ fontSize: '0.725rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    Optional spreadsheet DB
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Cloudflare Worker / Pages API Config */}
          <div className="filter-group" style={{ background: '#091122', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa' }}>
                <Cloud size={16} /> Cloudflare Worker / API Endpoint
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                onClick={() => setShowSqlCode(!showSqlCode)}
              >
                <Sparkles size={13} /> {showSqlCode ? 'Hide Schema' : 'D1 SQL Schema'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="Leave blank if hosted on Cloudflare Pages (uses relative /api), or enter https://your-worker.workers.dev"
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={testingCf}
                onClick={handleTestCloudflare}
                style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                {testingCf ? <RefreshCw size={14} className="spin" /> : 'Test Cloudflare'}
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              💡 If deployed directly on <strong>Cloudflare Pages</strong>, leave this blank (it auto-connects to <code>/api</code>). If hosted on GitHub Pages, enter your deployed Cloudflare Worker API URL.
            </div>

            {cfStatus && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: cfStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: cfStatus.success ? '#10b981' : '#f87171',
                border: `1px solid ${cfStatus.success ? '#047857' : '#b91c1c'}`
              }}>
                {cfStatus.message}
              </div>
            )}

            {/* SQL Schema Code Accordion */}
            {showSqlCode && (
              <div style={{ background: '#050a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem', marginTop: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
                    D1 SQL Initialization Schema
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                    onClick={handleCopySqlCode}
                  >
                    {copiedSql ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    {copiedSql ? 'Copied SQL!' : 'Copy SQL'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={8}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#020617', color: '#cbd5e1', whiteSpace: 'pre' }}
                  value={SQL_SCHEMA_CODE}
                />
              </div>
            )}
          </div>

          {/* Google Sheets API Config (Optional Integration) */}
          <div className="filter-group" style={{ background: '#091122', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
                <FileSpreadsheet size={16} /> Google Apps Script Web App URL (Optional)
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                onClick={() => setShowScriptCode(!showScriptCode)}
              >
                <Sparkles size={13} /> {showScriptCode ? 'Hide Code' : 'Apps Script Code'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={testingSheet}
                onClick={handleTestGoogleSheet}
                style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
              >
                {testingSheet ? <RefreshCw size={14} className="spin" /> : 'Test Sheet'}
              </button>
            </div>

            {sheetStatus && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: sheetStatus.success ? 'rgba(5, 150, 105, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: sheetStatus.success ? '#10b981' : '#f87171',
                border: `1px solid ${sheetStatus.success ? '#047857' : '#b91c1c'}`
              }}>
                {sheetStatus.message}
              </div>
            )}

            {showScriptCode && (
              <div style={{ background: '#050a14', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem', marginTop: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold-primary)' }}>
                    Google Apps Script Code
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                    onClick={handleCopyScriptCode}
                  >
                    {copiedScript ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    {copiedScript ? 'Copied Code!' : 'Copy Script Code'}
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={8}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#020617', color: '#cbd5e1', whiteSpace: 'pre' }}
                  value={GOOGLE_APPS_SCRIPT_CODE}
                />
              </div>
            )}
          </div>

          {/* ImgBB API Key Config (Optional Integration) */}
          <div className="filter-group" style={{ background: '#091122', padding: '1rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={15} /> ImgBB API Key (Optional Image Backup)
              </label>
              <a
                href="https://api.imgbb.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#3b82f6', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
              >
                Get Free Key <ExternalLink size={12} />
              </a>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 3a7b9c..."
              value={imgbbKey}
              onChange={(e) => setImgbbKey(e.target.value)}
              style={{ marginTop: '0.4rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
              Note: When Cloudflare R2 is enabled, images are stored in Cloudflare automatically. This key is used only as an optional backup service.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Save size={16} /> Save Integrations Settings
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
