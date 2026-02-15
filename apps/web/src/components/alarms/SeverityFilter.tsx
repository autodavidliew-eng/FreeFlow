'use client';

import type { AlarmSeverity } from '../../lib/alarms/types';

type SeverityFilterProps = {
  selected: AlarmSeverity[];
  onChange: (next: AlarmSeverity[]) => void;
};

const severities: AlarmSeverity[] = ['High', 'Medium', 'Low'];

export function SeverityFilter({ selected, onChange }: SeverityFilterProps) {
  const toggleSeverity = (severity: AlarmSeverity) => {
    if (selected.includes(severity)) {
      onChange(selected.filter((item) => item !== severity));
      return;
    }
    onChange([...selected, severity]);
  };

  const reset = () => {
    onChange([]);
  };

  return (
    <div className="ff-alarm-filter">
      <div className="ff-alarm-filter__label">Severity</div>
      <div className="ff-alarm-filter__actions">
        {severities.map((severity) => {
          const active = selected.includes(severity);
          return (
            <button
              key={severity}
              type="button"
              className={`ff-alarm-filter__chip ${active ? 'is-active' : ''}`}
              onClick={() => toggleSeverity(severity)}
            >
              {severity}
            </button>
          );
        })}
        <button
          type="button"
          className="ff-alarm-filter__reset"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
