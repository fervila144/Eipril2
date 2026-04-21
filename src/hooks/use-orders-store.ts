
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase/non-blocking-updates';
import { Order } from '@/lib/types';
import { useAdminStatus } from './use-admin-status';

export function useOrdersStore() {
  const db = useFirestore();
  const { isAdmin } = useAdminStatus();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'purchaseCode'>) => {
    if (!db) return;
    const id = crypto.randomUUID();
    // Generar un código de compra amigable de 6 caracteres
    const purchaseCode = id.substring(0, 6).toUpperCase();
    const docRef = doc(db, 'orders', id);
    
    setDocumentNonBlocking(docRef, {
      ...orderData,
      id,
      purchaseCode,
      status: 'pending',
      createdAt: serverTimestamp(),
    }, { merge: false });
    
    return { id, purchaseCode };
  };

  const confirmOrder = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'orders', id);
    updateDocumentNonBlocking(docRef, { status: 'confirmed' });
  };

  const deleteOrder = (id: string) => {
    if (!db) return;
    const docRef = doc(db, 'orders', id);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    orders: orders || [],
    isLoading,
    createOrder,
    confirmOrder,
    deleteOrder,
  };
}
