import { useEffect } from "react";

export type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "14px 20px",
        borderRadius: 10,
        background: type === "success" ? "#22c55e" : "#ef4444",
        color: "white",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      {message}
    </div>
  );
}