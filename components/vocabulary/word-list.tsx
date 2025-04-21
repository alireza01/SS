import { useState } from 'react';

import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';

interface Word {
  id: string;
  word: string;
  translation: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

interface WordListProps {
  words: Word[];
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
}

const WordList = ({ words, onEdit, onDelete }: WordListProps) => {
  const [deleteWordId, setDeleteWordId] = useState<string | null>(null);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!deleteWordId) return;

    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', deleteWordId);

      if (error) throw error;

      onDelete(deleteWordId);
      toast.success('Word deleted successfully');
    } catch (error: any) {
      console.error('Error deleting word:', error);
      toast.error(error.message || 'Failed to delete word');
    } finally {
      setDeleteWordId(null);
    }
  };

  const getDifficultyColor = (difficulty: Word['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Word</TableHead>
            <TableHead>Translation</TableHead>
            <TableHead>Definition</TableHead>
            <TableHead>Example</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow key={word.id}>
              <TableCell className="font-medium">{word.word}</TableCell>
              <TableCell>{word.translation}</TableCell>
              <TableCell>{word.definition}</TableCell>
              <TableCell>{word.example}</TableCell>
              <TableCell>
                <Badge className={getDifficultyColor(word.difficulty)}>
                  {word.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(word)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteWordId(word.id)}>
                      <Trash className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteWordId} onOpenChange={() => setDeleteWordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the word from your vocabulary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteWordId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WordList; 