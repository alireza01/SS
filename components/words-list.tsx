'use client';

import React from 'react';

import type { Word } from '@/types/vocabulary';

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
          className="cursor-pointer rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
          onClick={() => onWordSelect?.(word)}
        >
          <h3 className="text-lg font-semibold">{word.word}</h3>
          {word.meaning && (
            <p className="mt-1 text-gray-600">{word.meaning}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default WordsList; 