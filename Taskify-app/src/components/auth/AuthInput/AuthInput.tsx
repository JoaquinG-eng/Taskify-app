type PropiedadesDeAuthInput = {
  id: string;
  etiqueta: string;
  icono: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

function AuthInput({
  id,
  etiqueta,
  icono,
  type,
  placeholder,
  value,
  onChange,
  name,
  autoComplete,
  autoFocus = false,
}: PropiedadesDeAuthInput) {
  return (
    <div className="auth-campo">
      <label className="auth-campo__etiqueta" htmlFor={id}>
        {etiqueta}
      </label>

      <div className="auth-campo__input-wrap">
        <span className="auth-campo__icono">{icono}</span>

        <input
          id={id}
          name={name}
          autoComplete={autoComplete}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}

export default AuthInput;