type PropiedadesDePasswordStrength = {
  nivel: number;
  etiqueta: string;
  color: string;
};

function PasswordStrength({ nivel, etiqueta, color }: PropiedadesDePasswordStrength) {
  if (nivel === 0) return null;

  return (
    <div className="auth-campo__fuerza">
      <div className="auth-campo__fuerza-barras">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="auth-campo__fuerza-barra"
            style={{
              background: n <= nivel ? color : "#FFFFFF20",
            }}
          />
        ))}
      </div>

      <span
        style={{
          color,
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </span>
    </div>
  );
}

export default PasswordStrength;