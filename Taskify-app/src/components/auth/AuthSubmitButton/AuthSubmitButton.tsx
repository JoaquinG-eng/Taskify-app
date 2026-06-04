type PropiedadesDeAuthSubmitButton = {
  cargando: boolean;
  disabled?: boolean;
  texto: string;
};

function AuthSubmitButton({
  cargando,
  disabled = false,
  texto,
}: PropiedadesDeAuthSubmitButton) {
  return (
    <button
      type="submit"
      className={`auth-form__btn-primario ${
        cargando ? "auth-form__btn-primario--cargando" : ""
      }`}
      disabled={disabled}
    >
      {cargando ? <span className="auth-form__spinner" /> : texto}
    </button>
  );
}

export default AuthSubmitButton;