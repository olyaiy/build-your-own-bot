import { useState } from "react";
import { toast } from "sonner";

interface UseImageUploadOptions {
  endpoint?: string;
  onSuccess?: (url: string) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UseImageUploadReturn {
  imageUrl: string | null;
  isUploading: boolean;
  handleUpload: (file: File) => Promise<string | null>;
  resetImage: () => void;
  setImageUrl: (url: string | null) => void;
}

export function useImageUpload({
  endpoint = '/api/files/upload',
  onSuccess,
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png']
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return null;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      return null;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setImageUrl(data.url);
      toast.success('Image uploaded successfully');
      
      if (onSuccess) {
        onSuccess(data.url);
      }
      
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetImage = () => {
    setImageUrl(null);
  };

  return {
    imageUrl,
    isUploading,
    handleUpload,
    resetImage,
    setImageUrl
  };
} 