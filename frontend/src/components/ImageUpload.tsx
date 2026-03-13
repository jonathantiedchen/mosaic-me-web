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
              relative overflow-hidden border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer
              transition-all duration-300 group
              ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                  : hasErrors
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-white/10 hover:border-blue-500/30 hover:bg-white/5'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative flex flex-col items-center gap-5">
              <div className={`p-5 rounded-2xl transition-all duration-300 ${
                isDragActive
                  ? 'bg-blue-500/20 scale-110'
                  : hasErrors
                  ? 'bg-red-500/20'
                  : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:scale-110'
              }`}>
                <Upload
                  className={`w-10 h-10 transition-colors ${
                    hasErrors ? 'text-red-400' : isDragActive ? 'text-blue-400' : 'text-blue-300'
                  }`}
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-100 mb-2">
                  {isDragActive
                    ? 'Drop it like it\'s hot'
                    : 'Drop an image or click to browse'}
                </p>
                <p className="text-sm text-gray-400">
                  JPEG, PNG, or WebP • Max 10MB
                </p>
              </div>
              {hasErrors && (
                <div className="mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300 font-medium">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Or try an example
            </p>
            <div className="flex gap-2 max-w-xs">
              {SAMPLE_IMAGES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample.raw, sample.name)}
                  className="group relative overflow-hidden rounded border border-white/10 hover:border-blue-500/30 bg-white/5 hover:bg-white/10 p-1 transition-all duration-200 hover:scale-105 w-16"
                >
                  <div className="aspect-square rounded-sm overflow-hidden mb-1 bg-black/20">
                    <img
                      src={sample.raw}
                      alt={sample.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </div>
                  <p className="text-[8px] text-gray-500 group-hover:text-gray-300 text-center font-medium transition-colors leading-tight">
                    {sample.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-4 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-blue-300" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
