import { useEffect } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-900 border-green-700 text-green-100";
      case "error":
        return "bg-red-900 border-red-700 text-red-100";
      case "warning":
        return "bg-yellow-900 border-yellow-700 text-yellow-100";
      case "info":
        return "bg-blue-900 border-blue-700 text-blue-100";
      default:
        return "bg-slate-900 border-slate-700 text-slate-100";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getColors()} animate-in fade-in slide-in-from-right-4 duration-300`}
      role="alert"
    >
      {getIcon()}
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-current hover:opacity-75 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
