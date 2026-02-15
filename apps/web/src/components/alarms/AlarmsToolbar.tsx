'use client';

import type { AlarmSeverity } from '../../lib/alarms/types';

import { SeverityFilter } from './SeverityFilter';

type AlarmsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSeverities: AlarmSeverity[];
  onSeverityChange: (value: AlarmSeverity[]) => void;
};

export function AlarmsToolbar({
  search,
  onSearchChange,
  selectedSeverities,
  onSeverityChange,
}: AlarmsToolbarProps) {
  return (
    <div className="ff-alarm-toolbar">
      <div className="ff-alarm-search">
        <label htmlFor="alarm-search">Search</label>
        <input
          id="alarm-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by site, device, or description"
        />
      </div>
      <SeverityFilter
        selected={selectedSeverities}
        onChange={onSeverityChange}
      />
    </div>
  );
}
