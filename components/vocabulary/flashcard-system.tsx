'use client';

import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '@/types/vocabulary';

interface FlashcardSystemProps {
  words: Word[];
  onComplete?: () => void;
}

export const FlashcardSystem: React.FC<FlashcardSystemProps> = ({
  words,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedWords, setStudiedWords] = useState<Set<string>>(new Set());

  const currentWord = words[currentIndex];
  const isLastCard = currentIndex === words.length - 1;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (isLastCard) {
      onComplete?.();
      return;
    }
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
    setStudiedWords((prev) => new Set([...prev, currentWord.id]));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!words.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No flashcards available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 p-4">
      <div className="w-full">
        <div className="mb-4 flex justify-between">
          <span className="text-sm text-gray-500">
            Card {currentIndex + 1} of {words.length}
          </span>
          <span className="text-sm text-gray-500">
            Studied: {studiedWords.size} of {words.length}
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? '-flipped' : '')}
            initial={{ rotateY: 0, opacity: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="perspective-1000"
          >
            <Card
              className="min-h-[200px] w-full cursor-pointer bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
              onClick={handleFlip}
            >
              <div
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  backfaceVisibility: 'hidden',
                }}
                className="flex items-center justify-center text-center"
              >
                {isFlipped ? (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xl font-medium">{currentWord.meaning}</h3>
                    {currentWord.example && (
                      <div className="text-sm text-gray-600">
                        <p className="mb-2 font-medium">Example:</p>
                        <p className="italic">{currentWord.example}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{currentWord.word}</h2>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {isLastCard ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default FlashcardSystem; 