import React from 'react';
import InclusionCard from './InclusionCard';
import Pagination from './Pagination';
import { Layers, SearchX } from 'lucide-react';

export default function InclusionGrid({
  inclusions,
  totalCount,
  filteredCount,
  currentPage,
  pageSize,
  setCurrentPage,
  onSelectInclusion,
  selectedForCompare,
  onToggleCompare
}) {
  // Compute total pages based on the real total count, not the length of inclusions
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Clamp currentPage to the valid range to avoid slicing beyond available items
  const safeCurrentPage = Math.min(currentPage, totalPages) || 1;

  const startIndex = Math.min((safeCurrentPage - 1) * pageSize, inclusions.length);
  const endIndex = Math.min(startIndex + pageSize, inclusions.length);
  const currentItems = inclusions.slice(startIndex, endIndex);

  return (
    <main className="main-content">
      <div className="results-header">
        <div className="results-count">
          Results <strong>{startIndex + 1}</strong> - {endIndex} of <strong>{inclusions.length}</strong> inclusions (Page {safeCurrentPage} of {totalPages})
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing Lotus Gemology & Hyperion Specimen Records
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--bg-glass)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <SearchX size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            No matching inclusion records found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Try broadening your search filters or clearing keyword terms to explore other photomicrographs.
          </p>
        </div>
      ) : (
        <>
          <div className="inclusions-grid">
            {currentItems.map(inc => (
              <InclusionCard
                key={inc.id}
                inclusion={inc}
                onSelect={onSelectInclusion}
                isCompared={selectedForCompare.some(item => item.id === inc.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={page => {
              setCurrentPage(page);
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
          />
        </>
      )}
    </main>
  );
}