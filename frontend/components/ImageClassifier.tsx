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
    setError(error);
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
      if (classificationResult && classificationResult.in_queue) {
        pollClassification();
      } else {
        dispatch({ type: ActionType.Create, payload: classificationResult });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in classification API', error);
      setError('Error classifying the image.');
      dispatch({ type: ActionType.Create, payload: null });
      setIsLoading(false);
    }
  };

  const pollClassification = async () => {
    if (!selectedImage) return;
    const api = new ImageClassificationApi();

    let timeout = setTimeout(() => {
      clearInterval(interval);
      setError("Error classifying the image.");
      setIsLoading(false);
    }, 120000);

    let interval = setInterval(async () => {
      try {
        const classificationResult = await api.getImageClassification(selectedImage, true);
        if (classificationResult && !classificationResult.in_queue && classificationResult.predictions) {
          dispatch({ type: ActionType.Create, payload: classificationResult });
          setIsLoading(false);
          clearTimeout(timeout);
          clearInterval(interval);
        } else if (classificationResult && !classificationResult.in_queue && !classificationResult.predictions) {
          console.error('Error generating predictions in task');
          setError('Error classifying the image.');
        }
      } catch (error) {
        console.error('Error polling the image classification', error);
        setError('Error classifying the image.');
        setIsLoading(false);
        clearTimeout(timeout);
        clearInterval(interval);
      }
    }, 3000);
  }

  const handleClassifyClick = async () => {
    setIsLoading(true);
    setError(null);
    if (!selectedImage) return;
    const api = new ImageClassificationApi();

    try {
      const classificationResult = await api.getImageClassification(selectedImage, false);
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
        <ImageSelectorBox onImageSelected={handleImageSelected} disabled={isLoading} />

        <button
          disabled={isLoading || error !== null || selectedImage === null}
          className="w-64 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={handleClassifyClick}
        >
          {isLoading ? <><SpinnerIcon /> Classifying...</> : 'Classify'}
        </button>

        {error && (
          <div className="mt-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 px-3 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      {state.imageClassification && <ClassificationResult imageClassification={state.imageClassification} />}
    </div>
  );
};

export default ImageClassifier;
