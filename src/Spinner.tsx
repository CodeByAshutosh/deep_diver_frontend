export default function Spinner() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: "4px solid rgba(255,255,255,0.2)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "20px auto",
      }}
    />
  );
}