// ============================================================
// ARCHIVO: src/hooks/useAuth.ts
// Hook que escucha el estado de autenticación de Firebase.
// onAuthStateChanged notifica cada vez que el usuario
// inicia o cierra sesión, incluso al recargar la página.
// ============================================================

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface EstadoDeAuth {
  usuario:    User | null;
  cargando:   boolean;       
}

export function useAuth(): EstadoDeAuth {
  const [usuario,  setUsuario]  = useState<User | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
      const cancelarSuscripcion = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setCargando(false);
    });


    return () => cancelarSuscripcion();
  }, []);

  return { usuario, cargando };
}