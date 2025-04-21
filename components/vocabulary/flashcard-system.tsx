'use client';

import React, { useState, useEffect } from 'react';
import { Word } from '@/types/vocabulary';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
      <div className="text-center p-4">
        <p className="text-gray-500">No flashcards available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
      <div className="w-full">
        <div className="flex justify-between mb-4">
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
              className="w-full min-h-[200px] p-6 cursor-pointer bg-white shadow-lg hover:shadow-xl transition-shadow"
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
                    <h3 className="text-xl font-medium">{currentWord.definition}</h3>
                    {currentWord.examples && currentWord.examples.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">Examples:</p>
                        {currentWord.examples.map((example, idx) => (
                          <p key={idx} className="italic">{example}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{currentWord.term}</h2>
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