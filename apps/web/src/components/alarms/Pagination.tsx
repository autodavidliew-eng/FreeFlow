'use client';

import type { ReactNode } from 'react';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  summary?: ReactNode;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
  summary,
}: PaginationProps) {
  return (
    <div className="ff-alarm-pagination">
      <div className="ff-alarm-pagination__summary">
        {summary ?? `Page ${page} of ${totalPages}`}
      </div>
      <div className="ff-alarm-pagination__actions">
        <button
          type="button"
          className="ff-alarm-pagination__btn"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <button
          type="button"
          className="ff-alarm-pagination__btn"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
