import type { ReactNode } from "react";

type PropiedadesDeAuthPasswordInput = {
  id: string;
  etiqueta: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  verPassword: boolean;
  onTogglePassword: () => void;
  name?: string;
  autoComplete?: string;
  accionDerecha?: ReactNode;
  elementoDerechaInput?: ReactNode;
  contenidoInferior?: ReactNode;
};

function AuthPasswordInput({
  id,
  etiqueta,
  placeholder,
  value,
  onChange,
  verPassword,
  onTogglePassword,
  name,
  autoComplete,
  accionDerecha,
  elementoDerechaInput,
  contenidoInferior,
}: PropiedadesDeAuthPasswordInput) {
  return (
    <div className="auth-campo">
      <div className="auth-campo__label-fila">
        <label className="auth-campo__etiqueta" htmlFor={id}>
          {etiqueta}
        </label>

        {accionDerecha}
      </div>

      <div className="auth-campo__input-wrap">
        <span className="auth-campo__icono">🔒</span>

        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          type={verPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {elementoDerechaInput}

        <button
          type="button"
          className="auth-campo__toggle-pass"
          onClick={onTogglePassword}
          tabIndex={-1}
        >
          👁
        </button>
      </div>

      {contenidoInferior}
    </div>
  );
}

export default AuthPasswordInput;