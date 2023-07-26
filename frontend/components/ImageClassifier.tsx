import React, { useState, useReducer } from 'react';
import ImageSelectorBox from './ImageSelectorBox';
import { ImageClassificationApi } from '@/api/ImageClassification';
import { ImageClassificationReducer } from '@/StateManagement/ImageClassification/reducer';
import { ActionType } from '@/StateManagement/ImageClassification/actions';

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
    <div className={`w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center font-mono text-sm bg-gray-200 transition-all ease-in-out duration-500 ${state.imageClassification ? 'justify-start' : 'justify-center'}`}>
      <div className="flex flex-col items-center lg:w-1/2 transition-all ease-in-out duration-500">
        <ImageSelectorBox onImageSelected={handleImageSelected} />

        <button
          className="w-64 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={handleClassifyClick}
        >
          Classify
        </button>
      </div>

      {state.imageClassification && (
        <div className="flex flex-col items-center mt-4 lg:mt-0 lg:ml-4 lg:w-1/2 transition-all ease-in-out duration-500">
          <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
            {state.imageClassification ? (
              <span>Result</span>
            ) : (
              <span className="text-red-500">Failed</span>
            )}
          </div>
          <div className="mt-4 text-center">{state.imageClassification ? JSON.stringify(state.imageClassification.predictions) : 'Failed to classify.'}</div>
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
