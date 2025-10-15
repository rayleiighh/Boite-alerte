export default function EventItemRow({ e }) {
  const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="py-3 px-4">
        <span className="inline-block px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-full">
          {e.type}
        </span>
      </td>
      <td className="py-3 px-4">{formatDate(e.timestamp)}</td>
      <td className="py-3 px-4">{e.deviceID || "—"}</td>
    </tr>
  );
}
