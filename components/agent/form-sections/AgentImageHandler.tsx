"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { deleteAgentImage } from "@/app/(agents)/actions";
import AgentImageUploadSection from "./AgentImageUploadSection";

interface AgentImageHandlerProps {
  initialImageUrl?: string | null;
  agentId?: string;
  onImageChange: (url: string | null) => void;
}

export default function AgentImageHandler({
  initialImageUrl,
  agentId,
  onImageChange
}: AgentImageHandlerProps) {
  const {
    imageUrl,
    isUploading,
    handleUpload,
    resetImage,
    setImageUrl
  } = useImageUpload({
    endpoint: '/api/files/upload'
  });
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Initialize imageUrl from initialData if available
  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl, setImageUrl]);

  // Update parent component when imageUrl changes
  useEffect(() => {
    onImageChange(imageUrl);
  }, [imageUrl, onImageChange]);

  const handleDeleteImage = async () => {
    if (!agentId || !imageUrl) return;
    
    if (confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      setIsDeletingImage(true);
      try {
        // Delete image association from agent
        await deleteAgentImage(agentId, imageUrl);
        
        // Extract pathname from URL
        // URL format: https://pub-8ddd283c539f458b8f9ee190cb5cbbdd.r2.dev/filename
        const pathname = imageUrl.split('/').pop();
        
        if (pathname) {
          // Also delete the file from Cloudflare R2
          const response = await fetch('/api/files/upload', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pathname }),
          });
          
          if (!response.ok) {
            console.error('Failed to delete image file from storage');
          }
        }
        
        resetImage();
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error('Delete image error:', error);
        toast.error('Failed to delete image. Please try again.');
      } finally {
        setIsDeletingImage(false);
      }
    }
  };

  // Wrapping the handleUpload function to match the expected type
  const handleImageUpload = async (file: File): Promise<void> => {
    // Store the current image URL before uploading the new one
    const oldImageUrl = imageUrl;
    
    // Upload the new image
    await handleUpload(file);
    
    // If there was a previous image, delete it from storage
    if (oldImageUrl) {
      try {
        // Extract pathname from URL
        // URL format: https://pub-8ddd283c539f458b8f9ee190cb5cbbdd.r2.dev/filename
        const pathname = oldImageUrl.split('/').pop();
        
        if (pathname) {
          // Delete the old file from Cloudflare R2
          const response = await fetch('/api/files/upload', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pathname }),
          });
          
          if (!response.ok) {
            console.error('Failed to delete old image file from storage');
          }
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
  };

  return (
    <AgentImageUploadSection 
      imageUrl={imageUrl}
      isUploading={isUploading}
      isDeletingImage={isDeletingImage}
      handleUpload={handleImageUpload}
      handleDeleteImage={handleDeleteImage}
    />
  );
} 