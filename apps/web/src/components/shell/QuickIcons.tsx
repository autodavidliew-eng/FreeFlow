import { IconButton } from '../layout/IconButton';

export function QuickIcons() {
  return (
    <div className="ff-quick-icons">
      <IconButton aria-label="Apps">
        <span className="ff-icon">▦</span>
      </IconButton>
      <IconButton aria-label="Grid">
        <span className="ff-icon">▤</span>
      </IconButton>
      <IconButton aria-label="Notifications">
        <span className="ff-icon">🔔</span>
      </IconButton>
    </div>
  );
}
