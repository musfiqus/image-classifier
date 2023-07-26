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

  const getColor = (probability: number) => {
    if (probability >= 0.8) return 'bg-green-500';
    if (probability >= 0.6) return 'bg-lime-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    if (probability >= 0.2) return 'bg-amber-500';
    return 'bg-orange-500';
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

      {state.imageClassification && (
        <div className="flex flex-col items-start mt-4 lg:mt-0 lg:ml-4 lg:w-1/2 transition-all ease-in-out duration-500">
          <div className="w-full text-2xl font-bold mb-4">
            <span>Result</span>
          </div>
          {state.imageClassification.predictions.classes.map((className, index) => (
            <div key={index} className="w-full mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium">{className}</span>
                <span className="text-sm font-medium">{((state.imageClassification?.predictions?.probabilities[index] || 0) * 100).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`${getColor(state.imageClassification?.predictions?.probabilities[index] || 0)} h-2.5 rounded-full`} style={{ width: `${(state.imageClassification?.predictions?.probabilities[index] || 0) * 100}%` }}></div>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-4 w-full">
            <div className="flex items-center"><span className={`w-4 h-4 mr-2 ${getColor(0.8)}`}></span>80-100%</div>
            <div className="flex items-center"><span className={`w-4 h-4 mr-2 ${getColor(0.6)}`}></span>60-79%</div>
            <div className="flex items-center"><span className={`w-4 h-4 mr-2 ${getColor(0.4)}`}></span>40-59%</div>
            <div className="flex items-center"><span className={`w-4 h-4 mr-2 ${getColor(0.2)}`}></span>20-39%</div>
            <div className="flex items-center"><span className={`w-4 h-4 mr-2 ${getColor(0.00)}`}></span>0-19%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
