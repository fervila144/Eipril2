
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch((error) => {
    // En el modo silencioso, no registramos errores que puedan disparar el overlay de NextJS
    // si el error es esperado (como credenciales inválidas).
  });
}

/** 
 * Nota: Se recomienda usar await directamente en los componentes de formulario para Auth,
 * ya que la retroalimentación de éxito/error es inmediata y necesaria para el usuario.
 */

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    // Silencio intencional para evitar overlays en desarrollo.
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    // Silencio intencional para evitar overlays en desarrollo.
  });
}
