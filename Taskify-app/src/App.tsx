import { useEffect, useState } from "react";
import { AlertProvider } from "./context/AlertContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

type VistaAuth = "login" | "registro";

function AppContenido() {
  const { usuario, cargando } = useAuth();
  const [vistaAuth, setVistaAuth] = useState<VistaAuth>("login");
  const [passwordConfiguradaEnSesion, setPasswordConfiguradaEnSesion] =
    useState(false);

  useEffect(() => {
    setPasswordConfiguradaEnSesion(false);
  }, [usuario?.uid]);

  if (cargando) return null;

  if (usuario) {
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

    return (
      <ProtectedRoute alNoAutenticado={() => setVistaAuth("login")}>
        <DashboardPage />
      </ProtectedRoute>
    );
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
