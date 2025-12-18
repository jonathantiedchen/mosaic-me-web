import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { MosaicData, MosaicConfig } from '../types';
import { apiService } from '../services/api';

interface MosaicContextType {
  mosaicData: MosaicData | null;
  config: MosaicConfig;
  isLoading: boolean;
  error: string | null;
  uploadedFile: File | null;
  setConfig: (config: MosaicConfig) => void;
  setUploadedFile: (file: File | null) => void;
  generateMosaic: (file: File) => Promise<void>;
  clearMosaic: () => void;
}

const defaultConfig: MosaicConfig = {
  baseplateSize: 48,
  pieceType: 'square',
};

const MosaicContext = createContext<MosaicContextType | undefined>(undefined);

export function MosaicProvider({ children }: { children: ReactNode }) {
  const [mosaicData, setMosaicData] = useState<MosaicData | null>(null);
  const [config, setConfig] = useState<MosaicConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const generateMosaic = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.uploadImage(file, config);
        setMosaicData(response.mosaic);
        setUploadedFile(file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate mosaic';
        setError(errorMessage);
        console.error('Mosaic generation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  const clearMosaic = useCallback(() => {
    setMosaicData(null);
    setUploadedFile(null);
    setError(null);
  }, []);

  const value: MosaicContextType = {
    mosaicData,
    config,
    isLoading,
    error,
    uploadedFile,
    setConfig,
    setUploadedFile,
    generateMosaic,
    clearMosaic,
  };

  return <MosaicContext.Provider value={value}>{children}</MosaicContext.Provider>;
}

export function useMosaic() {
  const context = useContext(MosaicContext);
  if (context === undefined) {
    throw new Error('useMosaic must be used within a MosaicProvider');
  }
  return context;
}

export { MosaicContext };
