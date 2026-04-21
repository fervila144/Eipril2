
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function useAdminStatus() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user?.email) return null;
    // Ahora validamos por el email del usuario en la colección admins
    return doc(db, 'admins', user.email);
  }, [db, user?.email]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isSuperAdmin = user?.email === 'admin@gmail.com';
  const isAdmin = isSuperAdmin || !!adminDoc;

  return {
    isAdmin,
    isSuperAdmin,
    isLoading: isUserLoading || isAdminLoading,
    user,
  };
}
