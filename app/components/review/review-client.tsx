'use client'

import { useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import type { WordToReview, WordStatus } from '@/app/types/vocabulary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'

interface ReviewClientProps {
  wordsToReview: WordToReview[]
}

export function ReviewClient({ wordsToReview }: ReviewClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const currentWord = wordsToReview[currentIndex]
  const progress = ((currentIndex + 1) / wordsToReview.length) * 100

  if (!currentWord) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">All done!</h2>
        <p className="text-muted-foreground">You've reviewed all your words.</p>
      </div>
    )
  }

  const handleResponse = async (known: boolean) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Calculate next review date based on response
      const now = new Date()
      let nextReviewAt: Date
      let newStatus = currentWord.status as WordStatus

      if (known) {
        if (currentWord.status === 'new') {
          nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
          newStatus = 'learning' as WordStatus
        } else if (currentWord.status === 'learning') {
          nextReviewAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
          newStatus = 'known' as WordStatus
        } else {
          nextReviewAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      } else {
        nextReviewAt = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
        if (currentWord.status === 'known') {
          newStatus = 'learning' as WordStatus
        }
      }

      // Update word in database
      const { error } = await supabase
        .from('user_words')
        .update({
          status: newStatus,
          nextReviewAt: nextReviewAt.toISOString(),
          updatedAt: new Date().toISOString()
        })
        .eq('id', currentWord.id)

      if (error) throw error

      // Move to next word
      setCurrentIndex(prev => prev + 1)
      setShowMeaning(false)
    } catch (error) {
      console.error('Error updating word:', error)
      toast('Failed to update word status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review</h1>
        <div className="text-muted-foreground text-sm">
          {currentIndex + 1} / {wordsToReview.length}
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-center text-xl font-semibold">{currentWord.word}</h2>
              {currentWord.books && (
                <p className="text-muted-foreground text-center text-sm">
                  From: {currentWord.books.title}
                </p>
              )}
            </div>

            {showMeaning ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Meaning:</h3>
                  <p>{currentWord.meaning}</p>
                </div>
                {currentWord.example && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Example:</h3>
                    <p className="italic">{currentWord.example}</p>
                  </div>
                )}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(false)}
                    disabled={isSubmitting}
                  >
                    Still Learning
                  </Button>
                  <Button
                    onClick={() => handleResponse(true)}
                    disabled={isSubmitting}
                  >
                    I Know This
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowMeaning(true)}
                >
                  Show Meaning
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <div>Level: {currentWord.level}</div>
        <div>Status: {currentWord.status}</div>
      </div>
    </div>
  )
} 