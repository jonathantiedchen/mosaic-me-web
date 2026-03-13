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
    <div className="w-full space-y-6">
      {!uploadedFile ? (
        <>
          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer
              transition-all duration-500 group
              ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/30'
                  : hasErrors
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/5'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Glow effect */}
            <div className={`absolute inset-0 blur-3xl opacity-0 transition-opacity duration-500 ${isDragActive ? 'opacity-30' : 'group-hover:opacity-20'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            </div>

            <div className="relative flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 ${
                  isDragActive
                    ? 'bg-indigo-500/40 scale-125'
                    : hasErrors
                    ? 'bg-red-500/40'
                    : 'bg-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/30'
                }`}></div>
                <div className={`relative p-6 rounded-3xl transition-all duration-500 ${
                  isDragActive
                    ? 'bg-indigo-500/20 scale-110'
                    : hasErrors
                    ? 'bg-red-500/20'
                    : 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 group-hover:scale-110 backdrop-blur-xl'
                }`}>
                  <Upload
                    className={`w-12 h-12 transition-all duration-300 ${
                      hasErrors ? 'text-red-400' : isDragActive ? 'text-indigo-300' : 'text-indigo-400 group-hover:text-indigo-300'
                    }`}
                    strokeWidth={2}
                  />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-2 tracking-tight">
                  {isDragActive
                    ? 'Drop it right here'
                    : 'Drop an image or click to browse'}
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  JPEG, PNG, or WebP • Max 10MB
                </p>
              </div>
              {hasErrors && (
                <div className="mt-2 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-xl">
                  <p className="text-sm text-red-300 font-bold">{errorMessage}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
              Or try an example
            </p>
            <div className="flex gap-3">
              {SAMPLE_IMAGES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleClick(sample.raw, sample.name)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-white/10 p-2 transition-all duration-300 hover:scale-110 w-24 backdrop-blur-xl"
                  style={{
                    boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-2xl"></div>
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/20">
                    <img
                      src={sample.raw}
                      alt={sample.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />
                  </div>
                  <p className="relative text-[9px] text-gray-500 group-hover:text-gray-300 text-center font-bold transition-colors uppercase tracking-wider">
                    {sample.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card card-hover p-5 flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-40"></div>
            <div className="relative p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl backdrop-blur-xl flex-shrink-0">
              <ImageIcon className="w-7 h-7 text-indigo-300" strokeWidth={2} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate">
              {uploadedFile.name}
            </p>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-white/10 hover:border-red-500/30"
            aria-label="Remove image"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
