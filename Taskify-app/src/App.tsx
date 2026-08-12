import { useState } from "react";
import type { User } from "firebase/auth";
import { AlertProvider } from "./context/AlertContext";
import { useAuth } from "./hooks/useAuth";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

type VistaAuth = "login" | "registro";

function SesionAutenticada({ usuario }: { usuario: User }) {
  const [passwordConfiguradaEnSesion, setPasswordConfiguradaEnSesion] =
    useState(false);

  const tieneGoogle = usuario.providerData.some(
    (proveedor) => proveedor.providerId === "google.com"
  );
  const tienePassword = usuario.providerData.some(
    (proveedor) => proveedor.providerId === "password"
  );

  if (tieneGoogle && !tienePassword && !passwordConfiguradaEnSesion) {
    return (
      <SetPasswordPage
        usuario={usuario}
        alConfigurarPassword={() => setPasswordConfiguradaEnSesion(true)}
      />
    );
  }

  return <DashboardPage />;
}

function AppContenido() {
  const { usuario, cargando } = useAuth();
  const [vistaAuth, setVistaAuth] = useState<VistaAuth>("login");

  if (cargando) return null;

  if (usuario) {
    return <SesionAutenticada key={usuario.uid} usuario={usuario} />;
  }

  if (vistaAuth === "registro") {
    return (
      <RegisterPage
        alRegistrarse={() => {}}
        alIrALogin={() => setVistaAuth("login")}
      />
    );
  }

  return (
    <LoginPage
      alIniciarSesion={() => {}}
      alIrARegistro={() => setVistaAuth("registro")}
    />
  );
}

function App() {
  return (
    <AlertProvider>
      <AppContenido />
    </AlertProvider>
  );
}

export default App;
