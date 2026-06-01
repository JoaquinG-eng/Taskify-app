import { useState }      from "react";
import { AlertProvider } from "./context/AlertContext";
import { useAuth }       from "./hooks/useAuth";
import ProtectedRoute    from "./routes/ProtectedRoute";

import LoginPage     from "./pages/login and register/LoginPage";
import RegisterPage  from "./pages/login and register/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

type VistaAuth = "login" | "registro";

function AppContenido() {
  const { usuario, cargando } = useAuth();
  const [vistaAuth, setVistaAuth] = useState<VistaAuth>("login");

  if (cargando) return null;

  if (usuario) {
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