import { useEffect, useState } from "react";
import { fetchEvents } from "../services/events";
import EventItemRow from "../components/EventItem";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";

export default function HistoryPage() {
  const [items, setItems] = useState([]); // tableau d'événements
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "all" });
  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEvents({ ...filters, page, limit });

      if (res && Array.isArray(res.items)) {
        setItems(res.items); // ← utilise la propriété `items` renvoyée par le service
        setTotal(res.total ?? 0);
      } else {
        console.warn("API returned unexpected data:", res);
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
    <div className="container">
      <h1 className="h1">Historique</h1>

      <Filters
        initial={{ type: "all" }}
        onChange={(v) => {
          setFilters(v);
          setPage(1); // reset page quand on change les filtres
        }}
      />

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3}>Chargement…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3}>{error}</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3}>Aucun événement</td>
              </tr>
            ) : (
              items.map((e, i) => <EventItemRow key={i} e={e} />)
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} limit={limit} total={total} onPage={setPage} />
    </div>
  );
}
