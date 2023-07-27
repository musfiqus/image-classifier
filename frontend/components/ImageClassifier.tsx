import React, { useState, useReducer } from 'react';
import ImageSelectorBox from './ImageSelectorBox';
import { ImageClassificationApi } from '@/api/ImageClassification';
import { ImageClassificationReducer } from '@/StateManagement/ImageClassification/reducer';
import { ActionType } from '@/StateManagement/ImageClassification/actions';
import ClassificationResult from './ClassificationResult';
import SpinnerIcon from './SpinnerIcon';

interface ImageClassifierProps {}

const ImageClassifier: React.FC<ImageClassifierProps> = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [state, dispatch] = useReducer(ImageClassificationReducer, { imageClassification: null });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageSelected = (file: File | null, error: string | null) => {
    setError(error); // Set error from ImageSelectorBox
    if (error) {
      return;
    }
    setSelectedImage(file);
    state.imageClassification = null;
  };

  const classifyImage = async () => {
    if (!selectedImage) return;
    const api = new ImageClassificationApi();

    try {
      const classificationResult = await api.classifyImage(selectedImage);
      dispatch({ type: ActionType.Create, payload: classificationResult });
    } catch (error) {
      console.error('Error classifying the image:', error);
      setError('Error classifying the image');
      dispatch({ type: ActionType.Create, payload: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassifyClick = async () => {
    setIsLoading(true);
    if (!selectedImage) return;
    const api = new ImageClassificationApi();

    try {
      const classificationResult = await api.getImageClassification(selectedImage);
      dispatch({ type: ActionType.Create, payload: classificationResult });
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting the image classification:', error);
      classifyImage();
    }
  };

  return (
    <div className={`w-full max-w-5xl flex flex-col lg:flex-row justify-center font-mono text-sm bg-white transition-all ease-in-out duration-500 ${state.imageClassification ? 'justify-start' : 'justify-center'}`}>
      <div className="flex flex-col items-center lg:w-1/2 transition-all ease-in-out duration-500">
        <ImageSelectorBox onImageSelected={handleImageSelected} />

        <button
          disabled={isLoading || !!error} // Disable the button while loading or if there's an error
          className="w-64 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={handleClassifyClick}
        >
          {isLoading ? <><SpinnerIcon /> Classifying...</> : 'Classify'}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {state.imageClassification && <ClassificationResult imageClassification={state.imageClassification} />}
    </div>
  );
};

export default ImageClassifier;
