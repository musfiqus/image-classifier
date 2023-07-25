import React from 'react';
import ImageClassifier from "@/components/ImageClassifier";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-200">
      <h1 className="text-3xl font-semibold mb-8">Image Classifier</h1>
      <ImageClassifier />
    </main>
  );
}