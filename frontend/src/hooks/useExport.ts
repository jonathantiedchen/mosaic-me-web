import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { ExportType } from '../types';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportFile = useCallback(
    async (sessionId: string, exportType: ExportType, filename: string) => {
      setIsExporting(true);
      setExportError(null);

      try {
        const blob = await apiService.exportFile(sessionId, exportType);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setExportError(errorMessage);
        console.error('Export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportFile,
    isExporting,
    exportError,
  };
}
