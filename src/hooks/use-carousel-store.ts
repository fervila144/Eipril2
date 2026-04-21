
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';
import { CarouselSlide } from '@/lib/types';

const EMPTY_SLIDES: CarouselSlide[] = [];

export function useCarouselStore() {
  const db = useFirestore();
  
  const carouselQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'carousel'), orderBy('order', 'asc'));
  }, [db]);

  const { data: slidesData, isLoading } = useCollection<CarouselSlide>(carouselQuery);

  const addSlide = (slide: Omit<CarouselSlide, 'id' | 'createdAt'>) => {
    if (!db) return;
    const id = crypto.randomUUID();
    const docRef = doc(db, 'carousel', id);
    
    setDocumentNonBlocking(docRef, {
      ...slide,
      id,
      createdAt: serverTimestamp(),
    }, { merge: false });
  };

  const updateSlide = (id: string, updates: Partial<CarouselSlide>) => {
    if (!db) return;
    const docRef = doc(db, 'carousel', id);
    updateDocumentNonBlocking(docRef, updates);
  };

  const deleteSlide = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'carousel', id);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    slides: slidesData || EMPTY_SLIDES,
    isLoading,
    addSlide,
    updateSlide,
    deleteSlide,
  };
}
