import { useEffect, useState } from "react";
import { fetchEvents } from "../services/events";
import EventItemRow from "../components/EventItem";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";

export function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "all" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const limit = 5;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEvents({ ...filters, page, limit });
      if (res && Array.isArray(res.items)) {
        setItems(res.items);
        setTotal(res.total ?? 0);
      } else {
        setItems([]);
        setTotal(0);
        setError("Impossible de charger les événements.");
      }
    } catch (err) {
      console.error(err);
      setItems([]);
      setTotal(0);
      setError("Erreur lors de la récupération des événements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* --- Titre --- */}
        <h1 className="text-3xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
          <span className="inline-block w-1.5 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
          Historique
        </h1>

        {/* --- Filtres --- */}
        <div className="mb-6 bg-white/80 backdrop-blur-md border border-blue-100 shadow-md shadow-blue-100/50 rounded-2xl p-4">
          <Filters
            initial={{ type: "all" }}
            onChange={(v) => {
              setFilters(v);
              setPage(1);
            }}
          />
        </div>

        {/* --- Contenu principal --- */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          {/* TABLEAU (Desktop) */}
          <div className="hidden md:block">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center">
                      Chargement…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      Aucun événement
                    </td>
                  </tr>
                ) : (
                  items.map((e, i) => <EventItemRow key={i} e={e} />)
                )}
              </tbody>
            </table>
          </div>

          {/* CARDS (Mobile) */}
          <div className="md:hidden divide-y divide-slate-200">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Chargement…</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Aucun événement
              </div>
            ) : (
              items.map((e, i) => (
                <div key={i} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-full">
                      {e.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(e.timestamp).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong>Appareil :</strong> {e.deviceID || "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(e.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Pagination --- */}
        <div className="mt-6 flex justify-center md:justify-center items-center flex-wrap gap-3 pb-8">
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
