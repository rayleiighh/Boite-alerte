import { useState } from "react";

export default function Filters({ initial, onChange }) {
  const [values, setValues] = useState(initial);

  function update(key, value) {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange(next);
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-3">
      {/* Recherche textuelle */}
      <input
        type="search"
        placeholder="Rechercher..."
        className="flex-1 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={values.search || ""}
        onChange={(e) => update("search", e.target.value)}
      />
      
      {/* Type */}
      <select
        className="flex-1 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={values.type}
        onChange={(e) => update("type", e.target.value)}
      >
        <option value="all">Tous les types</option>
        <option value="courrier">Courrier</option>
        <option value="colis">Colis</option>
        <option value="ouverture">Ouverture</option>
      </select>

      {/* Date start */}
      <input
        type="date"
        className="flex-1 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={values.dateStart || ""}
        onChange={(e) => update("dateStart", e.target.value || undefined)}
      />

      {/* Date end */}
      <input
        type="date"
        className="flex-1 min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={values.dateEnd || ""}
        onChange={(e) => update("dateEnd", e.target.value || undefined)}
      />

      {/* Bouton reset */}
      <button
        className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl px-4 py-2 shadow-sm hover:opacity-90 transition"
        onClick={() => {
          setValues(initial);
          onChange(initial);
        }}
      >
        Réinitialiser
      </button>
    </div>
  );
}
