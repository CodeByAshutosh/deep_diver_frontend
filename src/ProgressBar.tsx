export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: 8,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 6,
        overflow: "hidden",
        marginTop: 10,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "#6366f1",
          transition: "width 0.2s ease-out",
        }}
      />
    </div>
  );
}