// src/ui/Modal.tsx
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function Modal({ open, onClose, title, children, actions }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[720px] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 shadow-xl">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="max-h-[75vh] overflow-auto">{children}</div>
        {actions && <div className="mt-4 flex items-center justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}
