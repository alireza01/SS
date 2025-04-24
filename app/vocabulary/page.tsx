import { Suspense } from 'react';

import type { Database } from '@/app/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AddWordForm from '@/components/vocabulary/add-word-form';
import WordList from '@/components/vocabulary/word-list';
import { createServerClient } from '@/lib/supabase/server';

type Word = Database['public']['Tables']['vocabulary']['Row'] & {
  books: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

async function getVocabulary(userId: string) {
  const supabase = await createServerClient();

  const { data: vocabulary, error } = await supabase
    .from('vocabulary')
    .select(`
      *,
      books:book_id (
        id,
        title,
        slug
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vocabulary:', error);
    return [];
  }

  return vocabulary as Word[];
}

async function getUserId() {
  const supabase = await createServerClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    console.error('Error getting user session:', error);
    return null;
  }

  return session.user.id;
}

export default async function VocabularyPage() {
  const userId = await getUserId();

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

  const words = await getVocabulary(userId);

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
            userId={userId}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
