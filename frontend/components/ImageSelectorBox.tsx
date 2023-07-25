import React, { useState, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';

interface ImageSelectorBoxProps {
  onImageSelected: (file: File | null) => void;
}

const ImageSelectorBox: React.FC<ImageSelectorBoxProps> = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      setSelectedImage(file);
      onImageSelected(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedImage(file);
      onImageSelected(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    onImageSelected(null);
  };

  return (
    <div
      className="relative flex items-center justify-center w-full h-96 mb-8 border-4 border-dashed rounded-lg border-gray-400 border-opacity-50 cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {selectedImage ? (
        <>
          <Image
            src={URL.createObjectURL(selectedImage)}
            alt="Selected Image"
            width={200}
            height={200}
            className="object-cover rounded-lg"
          />
          <button
            className="absolute top-0 right-0 m-2 p-1 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
            onClick={handleRemoveImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <label
            htmlFor="imageInput"
            className="relative w-full h-full flex items-center justify-center"
          >
            <p className="text-gray-400">
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