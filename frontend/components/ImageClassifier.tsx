// ImageClassifier.tsx
import React, { useState, useReducer } from 'react';
import ImageSelectorBox from './ImageSelectorBox';
import { ImageClassificationApi } from '@/api/ImageClassification';
import { ImageClassificationReducer } from '@/StateManagement/ImageClassification/reducer';
import { ActionType } from '@/StateManagement/ImageClassification/actions';
import ClassificationResult from './ClassificationResult';

interface ImageClassifierProps {}

const ImageClassifier: React.FC<ImageClassifierProps> = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [state, dispatch] = useReducer(ImageClassificationReducer, { imageClassification: null });

  const handleImageSelected = (file: File | null) => {
    setSelectedImage(file);
    state.imageClassification = null;
  };

  const handleClassifyClick = async () => {
    if (!selectedImage) return;
    try {
      const api = new ImageClassificationApi();
      const classificationResult = await api.classifyImage(selectedImage, selectedImage.name);
      dispatch({ type: ActionType.Create, payload: classificationResult });
    } catch (error) {
      console.error('Error classifying the image:', error);
      dispatch({ type: ActionType.Create, payload: null });
    }
  };

  return (
    <div className={`w-full max-w-5xl flex flex-col lg:flex-row justify-center font-mono text-sm bg-white transition-all ease-in-out duration-500 ${state.imageClassification ? 'justify-start' : 'justify-center'}`}>
      <div className="flex flex-col items-center lg:w-1/2 transition-all ease-in-out duration-500">
        <ImageSelectorBox onImageSelected={handleImageSelected} />

        <button
          className="w-64 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={handleClassifyClick}
        >
          Classify
        </button>
      </div>

      {state.imageClassification && <ClassificationResult imageClassification={state.imageClassification} />}
    </div>
  );
};

export default ImageClassifier;
