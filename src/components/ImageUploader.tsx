import React, { useState, useRef } from 'react';
import Button from './Button';

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<string>;
  currentImageUrl?: string;
  label?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  currentImageUrl,
  label = 'Upload Image',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Call the upload function passed as prop
      const uploadedImageUrl = await onImageUpload(file);
      setImageUrl(uploadedImageUrl);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center mb-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          onClick={handleButtonClick}
          isLoading={isUploading}
          disabled={isUploading}
          variant="secondary"
        >
          {label}
        </Button>
        {imageUrl && !isUploading && (
          <Button
            type="button"
            onClick={() => setImageUrl(undefined)}
            className="ml-2"
            variant="danger"
          >
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {imageUrl && (
        <div className="mt-2 border rounded-lg p-2">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-h-64 max-w-full object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;