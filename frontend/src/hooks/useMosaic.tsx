import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { MosaicData, MosaicConfig, MosaicGridCell, ShoppingListItem } from '../types';
import { apiService } from '../services/api';
import { generatePreviewFromGrid } from '../utils/canvasUtils';

interface MosaicContextType {
  mosaicData: MosaicData | null;
  config: MosaicConfig;
  isLoading: boolean;
  error: string | null;
  uploadedFile: File | null;
  /** The current mosaic has editor changes that regenerating would discard */
  isEdited: boolean;
  setConfig: (config: MosaicConfig) => void;
  setUploadedFile: (file: File | null) => void;
  /** Generate from file; pass a config to use it before the state update lands */
  generateMosaic: (file: File, configOverride?: MosaicConfig) => Promise<void>;
  clearMosaic: () => void;
  updateMosaicGrid: (newGrid: MosaicGridCell[][], newShoppingList: ShoppingListItem[]) => void;
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
  const [isEdited, setIsEdited] = useState(false);

  const generateMosaic = useCallback(
    async (file: File, configOverride?: MosaicConfig) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.uploadImage(file, configOverride ?? config);
        setMosaicData(response.mosaic);
        setIsEdited(false);
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
    setIsEdited(false);
    setError(null);
  }, []);

  const updateMosaicGrid = useCallback((newGrid: MosaicGridCell[][], newShoppingList: ShoppingListItem[]) => {
    if (!mosaicData) return;

    // Generate new preview from the edited grid
    const newPreviewUrl = generatePreviewFromGrid(newGrid);
    setIsEdited(true);

    setMosaicData({
      ...mosaicData,
      grid: newGrid,
      shoppingList: newShoppingList,
      previewUrl: newPreviewUrl,
      metadata: {
        ...mosaicData.metadata,
        uniqueColors: newShoppingList.length,
      },
    });
  }, [mosaicData]);

  const value: MosaicContextType = {
    mosaicData,
    config,
    isLoading,
    error,
    uploadedFile,
    isEdited,
    setConfig,
    setUploadedFile,
    generateMosaic,
    clearMosaic,
    updateMosaicGrid,
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
