import type { ReactNode } from "react";
import AuthBrandPanel from "../AuthBrandPanel";

type PropiedadesDeAuthLayout = {
  tituloPanel: ReactNode;
  descripcionPanel: string;
  modo: "login" | "registro";
  children: ReactNode;
};

function AuthLayout({
  tituloPanel,
  descripcionPanel,
  modo,
  children,
}: PropiedadesDeAuthLayout) {
  return (
    <div className="auth-layout">
      <AuthBrandPanel
        titulo={tituloPanel}
        descripcion={descripcionPanel}
        modo={modo}
      />

      <div className="auth-layout__form-wrap">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;