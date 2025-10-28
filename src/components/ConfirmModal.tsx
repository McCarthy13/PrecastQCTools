'use client';

import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmStyle?: 'default' | 'destructive';
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmStyle = 'default',
}: ConfirmModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        role="presentation"
        onClick={onCancel}
      />
      <div
        className="relative z-10 mx-5 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
      >
        <div className="space-y-3 px-6 py-5 text-left">
          <h2 id="confirm-modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <p id="confirm-modal-message" className="text-base leading-6 text-gray-600">
            {message}
          </p>
        </div>
        <div className="flex divide-x divide-gray-200 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-base font-semibold text-blue-600 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-base font-semibold transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 ${
              confirmStyle === 'destructive'
                ? 'text-red-600 focus-visible:ring-red-500'
                : 'text-blue-600 focus-visible:ring-blue-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
