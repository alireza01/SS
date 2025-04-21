'use client';

import React from 'react';
import { Word } from '@/types/vocabulary';

interface WordsListProps {
  words: Word[];
  bookId: string;
  onWordSelect?: (word: Word) => void;
  className?: string;
}

export const WordsList: React.FC<WordsListProps> = ({ words, bookId, onWordSelect, className = '' }) => {
  if (!words || words.length === 0) {
    return <div className="text-gray-500">No words available</div>;
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {words.map((word) => (
        <div
          key={word.id}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onWordSelect?.(word)}
        >
          <h3 className="font-semibold text-lg">{word.term}</h3>
          {word.definition && (
            <p className="text-gray-600 mt-1">{word.definition}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default WordsList; 