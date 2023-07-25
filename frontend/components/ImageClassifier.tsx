import React, { useState } from 'react';
import ImageSelectorBox from './ImageSelectorBox';

interface ImageClassifierProps {}

const ImageClassifier: React.FC<ImageClassifierProps> = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultVisible, setResultVisible] = useState<boolean>(false);

  const handleImageSelected = (file: File | null) => {
    setSelectedImage(file);
    setResult(null);
    setResultVisible(false);
  };

  const handleClassifyClick = async () => {
    if (!selectedImage) return;
    try {
      const classificationResult = await fetchAPI(selectedImage);
      setResult(classificationResult);
      setResultVisible(true);
    } catch (error) {
      console.error('Error classifying the image:', error);
      setResult('Failed to classify.');
      setResultVisible(true);
    }
  };

  return (
    <div className={`w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center font-mono text-sm bg-gray-200 transition-all ease-in-out duration-500 ${resultVisible ? 'justify-start' : 'justify-center'}`}>
      <div className="flex flex-col items-center lg:w-1/2 transition-all ease-in-out duration-500">
        <ImageSelectorBox onImageSelected={handleImageSelected} />

        <button
          className="w-64 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={handleClassifyClick}
        >
          Classify
        </button>
      </div>

      {resultVisible && (
        <div className="flex flex-col items-center mt-4 lg:mt-0 lg:ml-4 lg:w-1/2 transition-all ease-in-out duration-500">
          <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
            {result === 'Failed to classify.' ? (
              <span className="text-red-500">Failed</span>
            ) : (
              <span>Result</span>
            )}
          </div>
          <div className="mt-4 text-center">{result}</div>
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;

const fetchAPI = async (imageFile: File): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return 'Classification Result: [Class A: 80%, Class B: 15%, Class C: 5%]';
};
