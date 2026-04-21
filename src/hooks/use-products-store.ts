
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';
import { Product } from '@/lib/types';

const EMPTY_PRODUCTS: Product[] = [];

export function useProductsStore() {
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: productsData, isLoading } = useCollection<Product>(productsQuery);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    if (!db) return;
    const id = crypto.randomUUID();
    const docRef = doc(db, 'products', id);
    
    setDocumentNonBlocking(docRef, {
      ...product,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: false });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!db) return;
    const docRef = doc(db, 'products', id);
    updateDocumentNonBlocking(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProduct = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'products', id);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    products: productsData || EMPTY_PRODUCTS,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
