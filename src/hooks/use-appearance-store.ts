
"use client"

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { AppearanceSettings } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const DEFAULT_SETTINGS: AppearanceSettings = {
  primaryColor: '25 30% 35%', // Marrón Tierra Refinado
  fontFamily: 'Inter',
  logoText: 'EIPRIL',
  catalogTitle: 'Nuestros Productos',
  catalogSubtitle: 'Calidad excepcional y diseño en cada detalle.',
  logoUrl: '',
  faviconUrl: 'https://placehold.co/32x32/8B7355/ffffff?text=E',
  whatsappNumber: '5491168155653',
  hideCarouselOnMobile: false
};

export function useAppearanceStore() {
  const db = useFirestore();
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'appearance');
  }, [db]);

  const { data: appearance, isLoading } = useDoc<AppearanceSettings>(settingsRef);

  const updateAppearance = (updates: Partial<AppearanceSettings>) => {
    if (!db) return;
    const docRef = doc(db, 'settings', 'appearance');
    const newData = { ... (appearance || DEFAULT_SETTINGS), ...updates };
    
    setDoc(docRef, newData, { merge: true })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: newData
        }));
      });
  };

  return {
    appearance: appearance || DEFAULT_SETTINGS,
    isLoading,
    updateAppearance,
  };
}
