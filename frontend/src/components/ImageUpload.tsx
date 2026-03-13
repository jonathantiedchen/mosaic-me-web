import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const SAMPLE_IMAGES = [
  { raw: '/samples/raw_1.jpg', mosaic: '/samples/mosaic_1.png', name: 'Sample 1' },
  { raw: '/samples/raw_2.jpeg', mosaic: '/samples/mosaic_2.png', name: 'Sample 2' },
];

export function ImageUpload() {
  const { uploadedFile, setUploadedFile, clearMosaic } = useMosaic();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
      }
    },
    [setUploadedFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  const handleClear = () => {
    setUploadedFile(null);
    clearMosaic();
  };

  const handleSampleClick = async (samplePath: string, sampleName: string) => {
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const file = new File([blob], sampleName, { type: blob.type });
      setUploadedFile(file);
    } catch (error) {
      console.error('Failed to load sample image:', error);
    }
  };

  const hasErrors = fileRejections.length > 0;
  const errorMessage = hasErrors
    ? fileRejections[0].errors[0].code === 'file-too-large'
      ? 'File is too large. Maximum size is 10MB.'
      : fileRejections[0].errors[0].code === 'file-invalid-type'
      ? 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      : 'File upload error. Please try again.'
    : null;

  return (
    <div className="w-full space-y-4">
      {!uploadedFile ? (
        <>
          <div
            {...getRootProps()}
            className={`
              card border-dashed p-8 sm:p-10 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragActive
                  ? 'border-red-500/50 bg-red-500/5'
                  : hasErrors
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'hover:border-white/20 hover:bg-white/[0.02]'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-lg transition-colors ${
                isDragActive
                  ? 'bg-red-500/10'
                  : hasErrors
                  ? 'bg-red-500/10'
                  : 'bg-white/[0.03]'
              }`}>
                <Upload
                  className={`w-8 h-8 transition-colors ${
                    hasErrors ? 'text-red-400' : 'text-gray-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200 mb-1">
                  {isDragActive
                    ? 'Drop your image here'
                    : 'Drop an image here, or click to browse'}
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, or WebP • Max 10MB
                </p>
              </div>
              {hasErrors && (
                <div className="mt-1 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-subtle">
            <p className="text-xs text-gray-500 mb-3 font-medium">
              OR TRY AN EXAMPLE
            </p>
            <div className="flex gap-2">
              {SAMPLE_IMAGES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample.raw, sample.name)}
                  className="card card-hover flex-1 p-1.5 group"
                >
                  <div className="aspect-square rounded overflow-hidden mb-1.5 bg-white/[0.02]">
                    <img
                      src={sample.raw}
                      alt={sample.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 text-center font-medium">
                    {sample.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-3 flex items-center gap-3">
          <div className="p-2 bg-white/[0.06] rounded flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] rounded transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
