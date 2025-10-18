import { useState } from "react";
import { deleteEvent } from "../services/events";
import ConfirmModal from "./ConfirmModal";
import { Trash2 } from "lucide-react";

export default function EventItemRow({ e, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await deleteEvent(e._id);
      onDelete && onDelete(e._id);
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-slate-50 transition">
        <td className="py-3 px-4">
          <span className="inline-block px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-full">
            {e.type}
          </span>
        </td>
        <td className="py-3 px-4">{formatDate(e.timestamp)}</td>
        <td className="py-3 px-4">{e.deviceID || "—"}</td>
        <td className="py-3 px-4 text-right">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="text-red-500 hover:text-red-700 transition p-1"
            title="Supprimer l'événement"
          >
            <Trash2 className="w-5 h-5" strokeWidth={2} />
          </button>
        </td>
      </tr>

      {/* Une seule modale de confirmation, propre */}
      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Voulez-vous vraiment supprimer cet événement ?"
      />
    </>
  );
}
