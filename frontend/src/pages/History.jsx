import { useEffect, useState } from "react";
import { fetchEvents } from "../services/events";
import EventItemRow from "../components/EventItem";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container">
      <h1 className="h1">Historique</h1>

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
              <tr><td colSpan={3}>Chargement…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={3}>Aucun événement</td></tr>
            ) : (
              items.map((e, i) => <EventItemRow key={i} e={e} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
