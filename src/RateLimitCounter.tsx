import "./RateLimitCounter.css";

interface RateLimitCounterProps {
  used: number;
  total: number;
  onUpgrade?: () => void;
}

export function RateLimitCounter({ used, total, onUpgrade }: RateLimitCounterProps) {
  const remaining = total - used;
  const percentage = (used / total) * 100;
  const isLimitReached = used >= total;

  return (
    <div className="rate-limit-container">
      <div className="rate-limit-header">
        <span className="rate-limit-title">Free Slides</span>
        <span className="rate-limit-count">
          {used} / {total}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${isLimitReached ? "full" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {remaining > 0 && (
        <p className="remaining-text">{remaining} slide{remaining !== 1 ? "s" : ""} remaining</p>
      )}

      {isLimitReached && (
        <div className="limit-reached">
          <p className="limit-message">You've used all 5 free slides</p>
          {onUpgrade && (
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Pro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
