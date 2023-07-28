import React, { useState, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { isImageFile, isFileSizeValid } from '@/utils';
import CloseIcon from './CloseIcon';

interface ImageSelectorBoxProps {
  onImageSelected: (file: File | null, error: string | null) => void;
  disabled: boolean;
}

const ImageSelectorBox: React.FC<ImageSelectorBoxProps> = ({ onImageSelected, disabled }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      if (!isImageFile(file)) {
        onImageSelected(null, 'Please select a valid image file');
      } else if (!isFileSizeValid(file)) {
        onImageSelected(null, 'File size exceeds the 4MB limit');
      } else {
        setSelectedImage(file);
        onImageSelected(file, null);
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (!isImageFile(file)) {
        onImageSelected(null, 'Please drop a valid image file');
      } else if (!isFileSizeValid(file)) {
        onImageSelected(null, 'File size exceeds the 4MB limit');
      } else {
        setSelectedImage(file);
        onImageSelected(file, null);
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    onImageSelected(null, null);
  };

  return (
    <div
      className={`relative flex items-center justify-center w-full h-96 mb-8 border-4 border-dashed rounded-lg cursor-pointer ${(!selectedImage && (isHovered || isDragging)) ? 'border-blue-500' : 'border-gray-400 border-opacity-50'} ${disabled ? 'pointer-events-none' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {selectedImage ? (
        <>
          <Image
            src={URL.createObjectURL(selectedImage)}
            alt="Selected Image"
            layout="fill"
            objectFit="contain"
            className="object-cover rounded-lg"
          />
          <button
            className="absolute top-0 right-0 m-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
            onClick={handleRemoveImage}
          >
            <CloseIcon />
          </button>
        </>
      ) : (
        <>
          <label
            htmlFor="imageInput"
            className="relative w-full h-full flex items-center justify-center"
          >
            <p className="text-gray-400 p-4">
              Drag and drop an image file here or{' '}
              <span className="text-blue-500 cursor-pointer">click to select an image</span>
            </p>
          </label>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </>
      )}
    </div>
  );
};

export default ImageSelectorBox;
