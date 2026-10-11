import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-wrapper">
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        title="First Page"
      >
        <ChevronsLeft size={16} />
      </button>

      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map(page => (
        <button
          key={page}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="Next Page"
      >
        <ChevronRight size={16} />
      </button>

      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        title="Last Page"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
}
