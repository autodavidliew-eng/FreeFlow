'use client';

import { useMemo, useState } from 'react';

import type { AlarmRecord, AlarmSeverity } from '../../lib/alarms/types';

import { AlarmsTable } from './AlarmsTable';
import { AlarmsToolbar } from './AlarmsToolbar';
import { Pagination } from './Pagination';

type AlarmsViewProps = {
  alarms: AlarmRecord[];
};

const PAGE_SIZE = 6;

export function AlarmsView({ alarms }: AlarmsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<AlarmSeverity[]>(
    []
  );
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alarms.filter((alarm) => {
      const matchesSeverity =
        selectedSeverities.length === 0 ||
        selectedSeverities.includes(alarm.severity);
      if (!matchesSeverity) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [
        alarm.site,
        alarm.device,
        alarm.category,
        alarm.description,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [alarms, search, selectedSeverities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSeverityChange = (next: AlarmSeverity[]) => {
    setSelectedSeverities(next);
    setPage(1);
  };

  return (
    <div className="ff-alarm-view">
      <div className="ff-alarm-summary">
        <div>
          Active alarms: <strong>{filtered.length}</strong>
        </div>
        <div>Showing {paginated.length} records</div>
      </div>
      <AlarmsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        selectedSeverities={selectedSeverities}
        onSeverityChange={handleSeverityChange}
      />
      <AlarmsTable alarms={paginated} />
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        summary={`${filtered.length} results • Page ${currentPage} of ${totalPages}`}
      />
    </div>
  );
}
