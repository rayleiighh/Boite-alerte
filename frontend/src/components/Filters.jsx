import { useState } from "react";

export default function Filters({ initial, onChange }) {
  const [values, setValues] = useState(initial);

  function update(key, value) {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange(next);
  }

  return (
    <div className="card" style={{ marginBottom: "16px" }}>
      <div className="row" style={{ gap: "8px" }}>
        <select
          className="select"
          value={values.type}
          onChange={(e) => update("type", e.target.value)}
        >
          <option value="all">Tous les types</option>
          <option value="courrier">Courrier</option>
          <option value="colis">Colis</option>
          <option value="ouverture">Ouverture</option>
        </select>

        <input
          type="date"
          className="input"
          value={values.dateStart || ""}
          onChange={(e) => update("dateStart", e.target.value || undefined)}
        />

        <input
          type="date"
          className="input"
          value={values.dateEnd || ""}
          onChange={(e) => update("dateEnd", e.target.value || undefined)}
        />

        <button
          className="button"
          onClick={() => {
            setValues(initial);
            onChange(initial);
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
