import type { EventItem } from "../assets/mockEvents";

export default function EventItemRow({ e }: { e: EventItem }) {
  const dt = new Date(e.timestamp);
  const formatted = dt.toLocaleString();

  return (
    <tr>
      <td>{e.type}</td>
      <td>{formatted}</td>
      <td>{e.deviceID}</td>
    </tr>
  );
}
