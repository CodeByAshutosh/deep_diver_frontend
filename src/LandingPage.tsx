import "./LandingPage.css";

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">🎯</div>
        <h1>Deep Diver</h1>
        <p className="landing-tagline">Turning PRs into learning lessons in minutes</p>
        
        <div className="landing-features">
          <div className="landing-feature">
            <span className="feature-icon">📊</span>
            <h3>Auto-Generate Slides</h3>
            <p>Transforms any PR into beautiful learning slides</p>
          </div>
          <div className="landing-feature">
            <span className="feature-icon">⚡</span>
            <h3>5 Free Slides</h3>
            <p>Test drive with 5 PR slide generations</p>
          </div>
          <div className="landing-feature">
            <span className="feature-icon">🔗</span>
            <h3>Easy Share</h3>
            <p>Share slides with your team instantly</p>
          </div>
        </div>

        <button className="landing-btn" onClick={onEnter}>
          Get Started
        </button>
      </div>
    </div>
  );
}
