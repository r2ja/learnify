'use client';

import React, { useState, useRef } from 'react';

interface ProfileAvatarProps {
  initialImage?: string;
  editable: boolean;
  onImageChange?: (file: File) => void;
}

export function ProfileAvatar({ initialImage, editable, onImageChange }: ProfileAvatarProps) {
  const [image, setImage] = useState<string>(initialImage || '');
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default avatar if no image is provided
  const getInitials = () => {
    return 'PK'; // This would be dynamic in a real app
  };

  const handleImageClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(selectedFile);
      setImage(imageUrl);
      
      if (onImageChange) {
        onImageChange(selectedFile);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-32 h-32 rounded-full overflow-hidden"
        onMouseEnter={() => editable && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleImageClick}
      >
        {/* Avatar Image or Fallback */}
        {image ? (
          <img 
            src={image} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--primary)] text-white text-3xl font-semibold">
            {getInitials()}
          </div>
        )}
        
        {/* Edit Overlay */}
        {editable && isHovering && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200">
            <div className="text-white text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xs mt-1">Change Photo</p>
            </div>
          </div>
        )}
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      
      {editable && (
        <p className="text-sm text-gray-500 mt-2">
          Click to change profile picture
        </p>
      )}
    </div>
  );
} 