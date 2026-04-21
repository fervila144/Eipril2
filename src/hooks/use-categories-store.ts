
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';
import { Category } from '@/lib/types';

const EMPTY_CATEGORIES: Category[] = [];

export function useCategoriesStore() {
  const db = useFirestore();
  
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);

  const { data: categoriesData, isLoading } = useCollection<Category>(categoriesQuery);

  const addCategory = (name: string) => {
    if (!db) return;
    const id = crypto.randomUUID();
    const docRef = doc(db, 'categories', id);
    
    setDocumentNonBlocking(docRef, {
      id,
      name,
      createdAt: serverTimestamp(),
    }, { merge: false });
  };

  const deleteCategory = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'categories', id);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    categories: categoriesData || EMPTY_CATEGORIES,
    isLoading,
    addCategory,
    deleteCategory,
  };
}
