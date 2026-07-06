import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

/**
 * DeleteReportModal — Confirmation dialog for report deletion.
 *
 * Reference: UI-Guide.md §8 (Aesthetics)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const DeleteReportModal = ({ isOpen, onClose, onConfirm, reportName = '', isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-body font-black text-text-primary">Delete Report</h3>
        </div>

        <p className="text-body-sm text-text-secondary leading-relaxed mb-6">
          Are you sure you want to delete the report for <strong className="text-text-primary">{reportName}</strong>? 
          This action cannot be undone and will permanently remove both the database entry and files from the server.
        </p>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="font-bold py-2 px-4 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className="font-bold py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReportModal;
