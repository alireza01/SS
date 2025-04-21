import { Suspense } from 'react';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AddWordForm from '@/components/vocabulary/add-word-form';
import WordList from '@/components/vocabulary/word-list';
import { createServerClient } from '@/lib/supabase/server';

async function getVocabulary() {
  const supabase = createServerClient();

  const { data: vocabulary, error } = await supabase
    .from('vocabulary')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }

  return vocabulary;
}

async function getUserId() {
  const supabase = createServerClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('Error getting user session:', error);
    return null;
  }

  return session.user.id;
}

export default async function VocabularyPage() {
  const [words, userId] = await Promise.all([getVocabulary(), getUserId()]);

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to manage your vocabulary.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vocabulary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Suspense fallback={<Skeleton className="h-32" />}>
          <AddWordForm userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <WordList 
            words={words} 
            onEdit={(word) => {}} 
            onDelete={(id) => {}} 
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
