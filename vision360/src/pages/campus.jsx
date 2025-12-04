import { useState, useEffect } from "react";
import "./Campus.css";
import campusData from "../data/campus2.json";   // ton fichier avec les salles
import events from "../data/data.json";         // ton fichier avec les cours

function Campus() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fonction qui extrait un numéro dans un label de salle
  // Exemple : "BDX_J103_FA143_COURS" → 103
  const extractRoomNumber = (label) => {
    const match = label.match(/\d+/);
    return match ? match[0] : null;
  };

  useEffect(() => {
    const updatedRooms = campusData.rooms.map((room) => {
      // on récupère le numéro de salle : "salle12" → "12"
      const roomNumber = room.id.replace("salle", "");

      // on cherche un événement correspondant
      const event = events.find((ev) =>
        ev.resources.some((res) => {
          const num = extractRoomNumber(res.label);
          return num && num === roomNumber;
        })
      );

      if (!event) {
        return {
          ...room,
          status: "libre",
          morning: "libre",
          afternoon: "libre",
        };
      }

      const startHour = new Date(event.start).getHours();
      const endHour = new Date(event.end).getHours();

      return {
        ...room,
        status: "utilisée",
        morning: startHour < 12 ? "occupée" : "libre",
        afternoon: endHour > 12 ? "occupée" : "libre",
      };
    });

    setRooms(updatedRooms);
  }, []);

  const getRoomColor = (status) => {
    return status === "libre" ? "#4ade80" : "#ef4444";
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  return (
    <div className="campus-container">

      <div className="campus-header">
        <h1>Plan Interactif du Campus</h1>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color libre"></span> Libre
          </div>
          <div className="legend-item">
            <span className="legend-color utilisee"></span> Utilisée
          </div>
        </div>
      </div>

      <div className="campus-map">
        <img src="/terrasse.png" alt="Plan du campus" className="campus-image" />

        <div className="rooms-overlay">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="room-marker"
              style={{
                left: `${room.x}px`,
                top: `${room.y}px`,
                backgroundColor: getRoomColor(room.status),
              }}
              onClick={() => handleRoomClick(room)}
            >
              <div
                className="room-pulse"
                style={{ backgroundColor: getRoomColor(room.status) }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {selectedRoom && (
        <div className="room-info-panel">
          <div className="room-info-header">
            <h2>{selectedRoom.name}</h2>
            <button className="close-btn" onClick={() => setSelectedRoom(null)}>
              ×
            </button>
          </div>

          <div className="room-info-body">
            <div className="info-row">
              <span className="info-label">Statut :</span>
              <span className={`status-badge ${selectedRoom.status}`}>
                {selectedRoom.status === "libre" ? "🟢 Libre" : "🔴 Utilisée"}
              </span>
            </div>

            <h3>Horaires</h3>
            <div>
              Matin : {selectedRoom.morning === "libre" ? "✔ Libre" : "✖ Occupée"}
            </div>
            <div>
              Après-midi : {selectedRoom.afternoon === "libre" ? "✔ Libre" : "✖ Occupée"}
            </div>

            <div className="info-row">
              <span className="info-label">ID :</span> {selectedRoom.id}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Campus;
