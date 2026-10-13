import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import InclusionGrid from './components/InclusionGrid';
import InclusionModal from './components/InclusionModal';
import ComparisonModal from './components/ComparisonModal';
import AddEditModal from './components/AddEditModal';
import SettingsModal from './components/SettingsModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import {
  getStoredInclusions,
  saveStoredInclusions,
  resetStoredInclusions,
  getStorageProvider,
  getGoogleSheetUrl,
  getCloudflareWorkerUrl
} from './utils/storage';
import { fetchFromGoogleSheet, saveToGoogleSheet } from './utils/googleSheets';
import { fetchFromCloudflare, saveToCloudflare } from './utils/cloudflare';
import { fetchLiveHyperionInclusions } from './utils/lotusFetcher';

export default function App() {
  const [searchMode, setSearchMode] = useState(() => {
    return localStorage.getItem('hyperion_search_mode') || 'local';
  });
  const [localInclusions, setLocalInclusions] = useState(() => getStoredInclusions());
  const [storageProviderState, setStorageProviderState] = useState(() => getStorageProvider());
  const [googleSheetUrlState, setGoogleSheetUrlState] = useState(() => getGoogleSheetUrl());
  const [cloudflareWorkerUrlState, setCloudflareWorkerUrlState] = useState(() => getCloudflareWorkerUrl());

  // Live Lotus Search state
  const [liveInclusions, setLiveInclusions] = useState([]);
  const [liveTotalCount, setLiveTotalCount] = useState(0);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [filters, setFilters] = useState({
    gemtype: '',
    origin: '',
    enhancement: '',
    lighting: '',
    search: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals & Panels
  const [selectedInclusion, setSelectedInclusion] = useState(null);
  const [inclusionToEdit, setInclusionToEdit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Fetch Cloudflare D1 or Google Sheets data on mount / provider change if enabled
  useEffect(() => {
    if (storageProviderState === 'cloudflare') {
      fetchFromCloudflare(cloudflareWorkerUrlState)
        .then(cfData => {
          if (Array.isArray(cfData) && cfData.length > 0) {
            setLocalInclusions(cfData);
          }
        })
        .catch(err => {
          console.warn('Cloudflare D1 fetch notice:', err.message);
        });
    } else if (storageProviderState === 'sheet' && googleSheetUrlState) {
      fetchFromGoogleSheet(googleSheetUrlState)
        .then(sheetData => {
          if (Array.isArray(sheetData) && sheetData.length > 0) {
            setLocalInclusions(sheetData);
          }
        })
        .catch(err => {
          console.warn('Google Sheet fetch warning:', err);
        });
    }
  }, [storageProviderState, googleSheetUrlState, cloudflareWorkerUrlState]);

  // Persist searchMode preference
  useEffect(() => {
    localStorage.setItem('hyperion_search_mode', searchMode);
  }, [searchMode]);

  // Persist local inclusions whenever changed
  useEffect(() => {
    saveStoredInclusions(localInclusions);
  }, [localInclusions]);


  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchMode]);

  // Execute Live Lotus Fetch when in 'live' mode or when server filters/page change
  useEffect(() => {
    if (searchMode !== 'live') return;

    let isMounted = true;
    setIsLoadingLive(true);
    setLiveError(null);

    const startOffset = (currentPage - 1) * pageSize;
    const serverFilters = {
      gemtype: filters.gemtype,
      origin: filters.origin,
      enhancement: filters.enhancement,
      search: filters.search
    };

    fetchLiveHyperionInclusions(serverFilters, startOffset)
      .then(data => {
        if (!isMounted) return;
        setLiveInclusions(data.items);
        setLiveTotalCount(data.totalCount);
        setIsLoadingLive(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Live fetch error:', err);
        setLiveError(err.message);
        setIsLoadingLive(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters.gemtype, filters.origin, filters.enhancement, filters.search, currentPage, searchMode]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.gemtype) count++;
    if (filters.origin) count++;
    if (filters.enhancement) count++;
    if (filters.lighting) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  // Handle Clear Filters
  const handleClearFilters = () => {
    setFilters({
      gemtype: '',
      origin: '',
      enhancement: '',
      lighting: '',
      search: '',
      sortBy: 'newest'
    });
  };

  // Filter & Sort local inclusions
  const filteredLocalInclusions = useMemo(() => {
    return localInclusions.filter(inc => {
      if (filters.gemtype && inc.gemType !== filters.gemtype) return false;
      if (filters.origin && inc.origin !== filters.origin) return false;
      if (filters.enhancement && inc.enhancement !== filters.enhancement) return false;
      if (filters.lighting && inc.lighting !== filters.lighting) return false;
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const targetStr = [
          inc.title,
          inc.description,
          inc.gemType,
          inc.origin,
          inc.enhancement,
          inc.lighting,
          inc.photographer,
          inc.imageNumber,
          inc.taxonomy,
          ...(inc.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();

        if (!targetStr.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);
      if (filters.sortBy === 'oldest') return new Date(a.datePosted || 0) - new Date(b.datePosted || 0);
      if (filters.sortBy === 'gemType') return (a.gemType || '').localeCompare(b.gemType || '');
      if (filters.sortBy === 'fovAsc') return parseFloat(a.fieldOfView || 0) - parseFloat(b.fieldOfView || 0);
      if (filters.sortBy === 'fovDesc') return parseFloat(b.fieldOfView || 0) - parseFloat(a.fieldOfView || 0);
      return 0;
    });
  }, [localInclusions, filters]);

  // Filter & Sort live inclusions for client-side attributes (lighting, sortBy)
  const processedLiveInclusions = useMemo(() => {
    let result = liveInclusions;
    if (filters.lighting) {
      const query = filters.lighting.toLowerCase();
      result = result.filter(inc => (inc.lighting || '').toLowerCase().includes(query));
    }
    if (filters.sortBy) {
      result = [...result].sort((a, b) => {
        if (filters.sortBy === 'newest') return new Date(b.datePosted || 0) - new Date(a.datePosted || 0);
        if (filters.sortBy === 'oldest') return new Date(a.datePosted || 0) - new Date(b.datePosted || 0);
        if (filters.sortBy === 'gemType') return (a.gemType || '').localeCompare(b.gemType || '');
        if (filters.sortBy === 'fovAsc') return parseFloat(a.fieldOfView || 0) - parseFloat(b.fieldOfView || 0);
        if (filters.sortBy === 'fovDesc') return parseFloat(b.fieldOfView || 0) - parseFloat(a.fieldOfView || 0);
        return 0;
      });
    }
    return result;
  }, [liveInclusions, filters.lighting, filters.sortBy]);

  // Save live inclusion to local collection
  const handleSaveToLocalDB = (incToSave) => {
    const newEntry = {
      ...incToSave,
      id: `saved-${Date.now()}`
    };
    setLocalInclusions(prev => {
      if (prev.some(item => item.imageNumber === incToSave.imageNumber)) {
        alert('This specimen is already saved in your database collection!');
        return prev;
      }
      alert(`Saved "${incToSave.imageNumber}" to your database collection!`);
      return [newEntry, ...prev];
    });
    setSearchMode('local');

    if (storageProviderState === 'cloudflare') {
      saveToCloudflare(cloudflareWorkerUrlState, newEntry, 'save').catch(err => {
        console.error('Failed to sync saved item to Cloudflare D1:', err);
      });
    } else if (storageProviderState === 'sheet' && googleSheetUrlState) {
      saveToGoogleSheet(googleSheetUrlState, newEntry, 'save').catch(err => {
        console.error('Failed to sync saved item to Google Sheet:', err);
      });
    }
  };

  // Handle Add/Edit save
  const handleSaveInclusion = (savedRecord) => {
    setLocalInclusions(prev => {
      const existingIdx = prev.findIndex(item => item.id === savedRecord.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = savedRecord;
        return updated;
      } else {
        return [savedRecord, ...prev];
      }
    });
    setSearchMode('local');
    setShowAddModal(false);
    setInclusionToEdit(null);

    if (storageProviderState === 'cloudflare') {
      saveToCloudflare(cloudflareWorkerUrlState, savedRecord, 'save').catch(err => {
        console.error('Failed to sync record to Cloudflare D1:', err);
      });
    } else if (storageProviderState === 'sheet' && googleSheetUrlState) {
      saveToGoogleSheet(googleSheetUrlState, savedRecord, 'save').catch(err => {
        console.error('Failed to sync record to Google Sheet:', err);
      });
    }
  };

  // Handle Delete
  const handleDeleteInclusion = (id) => {
    if (confirm('Are you sure you want to delete this inclusion record?')) {
      const recordToDelete = localInclusions.find(item => item.id === id);
      setLocalInclusions(prev => prev.filter(item => item.id !== id));
      setSelectedInclusion(null);
      setSelectedForCompare(prev => prev.filter(item => item.id !== id));

      if (storageProviderState === 'cloudflare' && recordToDelete) {
        saveToCloudflare(cloudflareWorkerUrlState, recordToDelete, 'delete').catch(err => {
          console.error('Failed to delete record from Cloudflare D1:', err);
        });
      } else if (storageProviderState === 'sheet' && googleSheetUrlState && recordToDelete) {
        saveToGoogleSheet(googleSheetUrlState, recordToDelete, 'delete').catch(err => {
          console.error('Failed to delete record from Google Sheet:', err);
        });
      }
    }
  };

  // Active dataset depending on mode
  const displayInclusions = searchMode === 'live' ? processedLiveInclusions : filteredLocalInclusions;
  const displayTotalCount = searchMode === 'live' ? liveTotalCount : localInclusions.length;
  const displayFilteredCount = searchMode === 'live'
    ? (filters.lighting ? processedLiveInclusions.length : liveTotalCount)
    : filteredLocalInclusions.length;

  // Sync window global for export tools
  useEffect(() => {
    window.__currentInclusions = displayInclusions;
  }, [displayInclusions]);

  return (
    <div className="app-root">
      <Header
        totalCount={displayTotalCount}
        filteredCount={displayFilteredCount}
        onAddClick={() => {
          setInclusionToEdit(null);
          setShowAddModal(true);
        }}
        onImportSuccess={(list) => setLocalInclusions(list)}
        onResetDatabase={() => {
          const defaults = resetStoredInclusions();
          setLocalInclusions(defaults);
          handleClearFilters();
        }}
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        selectedForCompare={selectedForCompare}
        onOpenCompare={() => setShowCompareModal(true)}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        onOpenSettings={() => setShowSettingsModal(true)}
        storageProvider={storageProviderState}
      />

      <SearchFilters
        filters={filters}
        setFilters={setFilters}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {isLoadingLive && searchMode === 'live' ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--emerald-primary)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Fetching Live Inclusions from Lotus Gemology Hyperion...
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Parsing photomicrographs, metadata, and fields of view
          </div>
        </div>
      ) : liveError && searchMode === 'live' ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#ef4444' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Connection Error</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {liveError}
          </div>
        </div>
      ) : (
        <InclusionGrid
          inclusions={displayInclusions}
          totalCount={displayTotalCount}
          filteredCount={displayFilteredCount}
          currentPage={currentPage}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          onSelectInclusion={(inc) => setSelectedInclusion(inc)}
          selectedForCompare={selectedForCompare}
          isServerPaginated={searchMode === 'live'}
          onToggleCompare={(inc) => {
            setSelectedForCompare(prev => {
              const exists = prev.some(i => i.id === inc.id);
              if (exists) return prev.filter(i => i.id !== inc.id);
              if (prev.length >= 2) {
                alert('You can compare up to 2 specimens at a time.');
                return prev;
              }
              return [...prev, inc];
            });
          }}
        />
      )}

      {/* Lightbox Modal */}
      {selectedInclusion && (
        <InclusionModal
          inclusion={selectedInclusion}
          onClose={() => setSelectedInclusion(null)}
          onEdit={(inc) => {
            setSelectedInclusion(null);
            setInclusionToEdit(inc);
            setShowAddModal(true);
          }}
          onDelete={handleDeleteInclusion}
          onSaveToLocal={handleSaveToLocalDB}
        />
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || inclusionToEdit) && (
        <AddEditModal
          inclusionToEdit={inclusionToEdit}
          onSave={handleSaveInclusion}
          onClose={() => {
            setShowAddModal(false);
            setInclusionToEdit(null);
          }}
        />
      )}

      {/* Cloud & API Integrations Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSettingsSaved={() => {
            setStorageProviderState(getStorageProvider());
            setGoogleSheetUrlState(getGoogleSheetUrl());
            setCloudflareWorkerUrlState(getCloudflareWorkerUrl());
          }}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <ComparisonModal
          selectedItems={selectedForCompare}
          onClose={() => setShowCompareModal(false)}
          onRemoveItem={(id) => {
            setSelectedForCompare(prev => prev.filter(i => i.id !== id));
          }}
        />
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <AnalyticsDashboard
          inclusions={searchMode === 'live' ? liveInclusions : localInclusions}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}
