// ============================================================
// ARCHIVO: src/services/firebase.ts
// Inicializa Firebase una sola vez y exporta los servicios
// que usa el resto de la app: auth y db (Firestore).
// Las credenciales vienen de variables de entorno VITE_
// para que nunca queden expuestas en el repositorio.
// ============================================================

import { initializeApp }       from "firebase/app";
import { getAuth }             from "firebase/auth";
import { getFirestore }        from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// initializeApp lanza error si se llama dos veces — esto lo previene
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);