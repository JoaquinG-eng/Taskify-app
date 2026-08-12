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
      if (usuarioActual) {
        const tieneGoogle = usuarioActual.providerData.some(
          (proveedor) => proveedor.providerId === "google.com"
        );
        const tienePassword = usuarioActual.providerData.some(
          (proveedor) => proveedor.providerId === "password"
        );

        const requiereVerificacion =
          tienePassword && !tieneGoogle && !usuarioActual.emailVerified;

        setUsuario(requiereVerificacion ? null : usuarioActual);
      } else {
        setUsuario(null);
      }

      setCargando(false);
    });


    return () => cancelarSuscripcion();
  }, []);

  return { usuario, cargando };
}