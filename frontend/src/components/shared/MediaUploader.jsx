// MediaUploader.jsx - FIXED VERSION
import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const MediaUploader = ({ 
  onValueChange, 
  setImage, 
  image, 
  publicId, 
  type,
  transformationConfig 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // FIXED: Remove double slash in API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const uploadImage = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = await getToken();
      
      // FIXED: Remove double slash
      const uploadUrl = `${API_BASE_URL}/api/images/upload`;
      console.log('Upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const imageData = await response.json();
      console.log('Upload success:', imageData);
      
      // Update image state
      const newImage = {
        publicId: imageData.publicId,
        width: imageData.width,
        height: imageData.height,
        secureURL: imageData.secureURL,
        format: imageData.format
      };

      setImage(newImage);
      onValueChange(imageData.publicId);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Upload failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      uploadImage(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      uploadImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="media-uploader">
      {publicId && image ? (
        // Show uploaded image
        <div className="media-uploader_preview">
          <div className="media-uploader_image">
            <img
              src={image.secureURL}
              alt="Uploaded image"
              width={image.width}
              height={image.height}
              className="media-uploader_img"
            />
          </div>
          
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="media-uploader_btn-remove"
          >
            Replace Image
          </Button>
        </div>
      ) : (
        // Show upload area
        <div 
          className={`media-uploader_cta ${dragOver ? 'media-uploader_cta-drag' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div className="media-uploader_uploading">
              <div className="loader"></div>
              <p className="p-14-medium">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="media-uploader_cta-image">
                <img
                  src="/assets/icons/add.svg"
                  alt="Add Image"
                  width={24}
                  height={24}
                />
              </div>
              <p className="p-14-medium">Click here to upload image</p>
              <p className="p-12-regular text-dark-400">
                Drag and drop or click to browse
              </p>
              <p className="p-12-regular text-dark-400">
                SVG, PNG, JPG (max 10MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;