import { useState } from "react";
import type { EventType } from "../assets/mockEvents";

export interface FiltersValue {
  type: EventType | "all";
  dateStart?: string;
  dateEnd?: string;
}

export default function Filters({
  initial,
  onChange,
}: {
  initial: FiltersValue;
  onChange: (v: FiltersValue) => void;
}) {
  const [v, setV] = useState<FiltersValue>(initial);

  function update<K extends keyof FiltersValue>(key: K, value: FiltersValue[K]) {
    const next = { ...v, [key]: value };
    setV(next);
    onChange(next);
  }

  return (
    <div className="card" style={{ marginBottom: "16px" }}>
      <div className="row" style={{ gap: "8px" }}>
        <select
          className="select"
          value={v.type}
          onChange={(e) => update("type", e.target.value as FiltersValue["type"])}
        >
          <option value="all">Tous les types</option>
          <option value="courrier">Courrier</option>
          <option value="colis">Colis</option>
          <option value="ouverture">Ouverture</option>
        </select>

        <input
          type="date"
          className="input"
          value={v.dateStart ?? ""}
          onChange={(e) => update("dateStart", e.target.value || undefined)}
        />

        <input
          type="date"
          className="input"
          value={v.dateEnd ?? ""}
          onChange={(e) => update("dateEnd", e.target.value || undefined)}
        />

        <button
          className="button"
          onClick={() => {
            setV(initial);
            onChange(initial);
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
