import { theme } from "./theme";

type SlideViewerProps = {
  url: string;
  onBack: () => void;
};

function SlideViewer({ url, onBack }: SlideViewerProps) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          background: "transparent",
          color: theme.colors.textMuted,
          border: "none",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: 32, marginBottom: 20 }}>📚 Slide Deck</h2>

      <iframe
        src={url}
        style={{
          width: "100%",
          height: "80vh",
          borderRadius: theme.radius,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadow,
        }}
      />
    </div>
  );
}

export default SlideViewer;