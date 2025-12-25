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

  const hasErrors = fileRejections.length > 0;
  const errorMessage = hasErrors
    ? fileRejections[0].errors[0].code === 'file-too-large'
      ? 'File is too large. Maximum size is 10MB.'
      : fileRejections[0].errors[0].code === 'file-invalid-type'
      ? 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      : 'File upload error. Please try again.'
    : null;

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            glass-card border-2 border-dashed p-6 sm:p-8 lg:p-10 text-center cursor-pointer
            transition-all duration-300 ease-out group hover:scale-[1.02]
            ${
              isDragActive
                ? 'border-purple-400 bg-purple-500/20 shadow-glow'
                : hasErrors
                ? 'border-red-400 bg-red-500/20'
                : 'border-white/30 hover:border-purple-400/50 hover:shadow-glow'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5">
            <div className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 ${
              isDragActive
                ? 'bg-purple-500/30 scale-110'
                : hasErrors
                ? 'bg-red-500/20'
                : 'bg-white/10 group-hover:bg-purple-500/20'
            }`}>
              <Upload
                className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transition-colors ${
                  hasErrors ? 'text-red-300' : 'text-purple-300 group-hover:text-purple-200'
                }`}
              />
            </div>
            <div>
              <p className="text-sm sm:text-base lg:text-lg font-semibold text-white">
                {isDragActive
                  ? 'Drop your image here'
                  : 'Drag & drop an image, or click to select'}
              </p>
              <p className="text-xs sm:text-sm text-purple-200 mt-1 sm:mt-2">
                JPEG, PNG, or WebP (max 10MB)
              </p>
            </div>
            {hasErrors && (
              <div className="mt-2 px-3 py-2 sm:px-4 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-xs sm:text-sm text-red-200 font-medium">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-3 sm:p-4 lg:p-5 hover:shadow-glow transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex-shrink-0">
              <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs sm:text-sm text-purple-200">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleClear}
              className="flex-shrink-0 p-2 text-red-300 hover:bg-red-500/20 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 touch-manipulation"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
