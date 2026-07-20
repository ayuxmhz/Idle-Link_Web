import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2b36]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-[#2a2b36] bg-[#111218]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent border border-gray-600 rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
