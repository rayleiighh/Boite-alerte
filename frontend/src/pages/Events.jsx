// frontend/src/pages/Events.jsx
import DeviceStatus from "../components/DeviceStatus";
import EventItemRow from "../components/EventItem";

export default function Events() {
  return (
    <div className="p-6 space-y-6">
      {/* Status en haut */}
      <DeviceStatus />
      
      {/* Liste événements */}
      <table>
        {/* ... */}
      </table>
    </div>
  );
}