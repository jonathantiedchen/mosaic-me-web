import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { useMosaic } from '../hooks/useMosaic';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const SAMPLE_EXAMPLES = [
  { raw: '/samples/raw_1.jpg', mosaic: '/samples/mosaic_1.png', name: 'Example 1' },
  { raw: '/samples/raw_2.jpeg', mosaic: '/samples/mosaic_2.png', name: 'Example 2' },
];

export function ImageUpload() {
  const { uploadedFile, setUploadedFile, clearMosaic } = useMosaic();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) setUploadedFile(acceptedFiles[0]);
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
      ? 'File is too large. Maximum size is 10 MB.'
      : fileRejections[0].errors[0].code === 'file-invalid-type'
      ? 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      : 'File upload error. Please try again.'
    : null;

  if (uploadedFile) {
    return (
      <div className="panel flex items-center gap-4 px-4 py-3">
        <div className="bg-border flex-shrink-0" style={{ padding: '8px', borderRadius: '2px' }}>
          <ImageIcon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {uploadedFile.name}
          </p>
          <p className="text-text-muted" style={{ fontSize: '11px', fontWeight: 300, marginTop: '2px' }}>
            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex-shrink-0 text-text-muted hover:text-error-light transition-colors"
          style={{ padding: '4px' }}
          aria-label="Remove image"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? ' drag-active' : ''}${hasErrors ? ' has-error' : ''}`}
      >
        <input {...getInputProps()} />
        <div style={{
          width: '36px',
          height: '36px',
          border: '1.5px solid #3a3530',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: '#6b6460',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
        </div>
        <p className="font-sans text-text-subtle" style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
          {isDragActive ? 'Drop it here' : 'Drop a photo, or click to browse'}
        </p>
        <p className="font-sans text-text-muted" style={{ fontSize: '11px', fontWeight: 300 }}>
          JPG, PNG, WEBP — up to 10 MB
        </p>
        {hasErrors && (
          <p className="text-error-light" style={{ fontSize: '12px', marginTop: '10px' }}>{errorMessage}</p>
        )}
      </div>

      {/* Examples */}
      <div style={{ borderTop: '1px solid #2e2a26', paddingTop: '20px' }}>
        <p className="chip-label" style={{ textAlign: 'center', marginBottom: '14px' }}>
          Examples
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {SAMPLE_EXAMPLES.map((example, index) => (
            <div key={index} className="panel" style={{ padding: '12px' }}>
              <div className="flex gap-3">
                <img
                  src={example.raw}
                  alt={`${example.name} - Original`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <img
                  src={example.mosaic}
                  alt={`${example.name} - Mosaic`}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '2px' }}
                />
              </div>
              <p className="chip-label" style={{ textAlign: 'center', marginTop: '10px', marginBottom: 0 }}>
                {example.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
