
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  setDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase/non-blocking-updates';

export interface AdminUser {
  id: string;
  email: string;
  addedAt: any;
}

export function useAdminsManagement() {
  const db = useFirestore();

  const adminsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'admins'), orderBy('email', 'asc'));
  }, [db]);

  const { data: admins, isLoading } = useCollection<AdminUser>(adminsQuery);

  const addAdmin = (email: string) => {
    if (!db || !email) return;
    const cleanEmail = email.trim().toLowerCase();
    const docRef = doc(db, 'admins', cleanEmail);
    
    setDocumentNonBlocking(docRef, {
      email: cleanEmail,
      addedAt: serverTimestamp(),
    }, { merge: true });
  };

  const removeAdmin = (email: string) => {
    if (!db || !email) return;
    const docRef = doc(db, 'admins', email);
    deleteDocumentNonBlocking(docRef);
  };

  return {
    admins: admins || [],
    isLoading,
    addAdmin,
    removeAdmin,
  };
}
