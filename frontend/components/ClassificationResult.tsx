// ClassificationResult.tsx
import React from 'react';
import { ImageClassification } from '@/api/ImageClassification';

interface ClassificationResultProps {
  imageClassification: ImageClassification | null;
}

const ClassificationResult: React.FC<ClassificationResultProps> = ({ imageClassification }) => {
  const getColor = (probability: number) => {
    if (probability >= 0.8) return 'bg-green-500';
    if (probability >= 0.6) return 'bg-lime-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    if (probability >= 0.2) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <div className="flex flex-col items-start mt-4 lg:mt-0 lg:ml-4 lg:w-1/2 transition-all ease-in-out duration-500">
      <div className="w-full text-2xl font-bold mb-4">
        <span>Result</span>
      </div>
      {imageClassification?.predictions.classes.map((className, index) => (
        <div key={index} className="w-full mt-2">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium">{className}</span>
            <span className="text-sm font-medium">{((imageClassification?.predictions?.probabilities[index] || 0) * 100).toFixed(2)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className={`${getColor(imageClassification?.predictions?.probabilities[index] || 0)} h-2.5 rounded-full`} style={{ width: `${(imageClassification?.predictions?.probabilities[index] || 0) * 100}%` }}></div>
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
  );
};

export default ClassificationResult;
