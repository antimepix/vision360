import { useState, useEffect } from "react";
import "./campus.css";

// ⚠️ Ces fichiers doivent exister dans src/data/
// Tu peux partir de ceux que tu avais dans l'ancien projet (campus0/1/2.json).
import campus0 from "../data/campus0.json"; // rez-de-chaussée
import campus1 from "../data/campus1.json"; // 1er étage
import campus2 from "../data/campus2.json"; // 2e étage

import events from "../data/data.json"; // cours

// Associe chaque étage à son JSON + son image
const FLOOR_CONFIGS = {
  ground: {
    id: "ground",
    label: "rez de chaussée",
    data: campus0,
    imageSrc: "/rdc.png",
  },
  first: {
    id: "first",
    label: "1er étage",
    data: campus1,
    imageSrc: "/premierEtage.jpg", // ✅ ton image du 1er étage
  },
  second: {
    id: "second",
    label: "2e étage",
    data: campus2,
    imageSrc: "/terrasse.png", // ton image actuelle du 2e étage
  },
};

function Campus() {
  // on démarre sur le 2e étage comme tu voulais
  const [selectedFloor, setSelectedFloor] = useState("second");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // extrait un numéro de salle dans un label : "BDX_J103_FA143_COURS" → "103"
  const extractRoomNumber = (labelOrCode) => {
    const match = String(labelOrCode ?? "").match(/\d+/);
    return match ? match[0] : null;
  };

  // 🔁 Recalcul du nuage de points à chaque changement d’étage
  useEffect(() => {
    const floorConfig = FLOOR_CONFIGS[selectedFloor];
    const campusData = floorConfig?.data;
    const baseRooms = campusData?.rooms ?? [];

    const updatedRooms = baseRooms.map((room) => {
      // "salle209" -> "209"
      const roomNumber = String(room.id || "").replace("salle", "");

      // on cherche un événement correspondant à cette salle
      const event = events.find((ev) =>
        (ev.resources ?? []).some((res) => {
          const num = extractRoomNumber(res.label ?? res.code);
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
    setSelectedRoom(null); // on ferme le panneau si on change d’étage
  }, [selectedFloor]);

  const getRoomColor = (status) =>
    status === "libre" ? "#4ade80" : "#ef4444";

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const currentFloor = FLOOR_CONFIGS[selectedFloor];

  return (
    <div className="campus-container">
      <div className="campus-header">
        <h1>Plan Interactif du Campus</h1>

        {/* Boutons d'étage */}
        <div className="campus-floorTabsWrapper">
          <div className="campus-floorTabs">
            <button
              type="button"
              className={
                selectedFloor === "ground"
                  ? "campus-floorBtn active"
                  : "campus-floorBtn"
              }
              onClick={() => setSelectedFloor("ground")}
            >
              rez de chaussée
            </button>

            <button
              type="button"
              className={
                selectedFloor === "first"
                  ? "campus-floorBtn active"
                  : "campus-floorBtn"
              }
              onClick={() => setSelectedFloor("first")}
            >
              1<sup>er</sup> étage
            </button>

            <button
              type="button"
              className={
                selectedFloor === "second"
                  ? "campus-floorBtn active"
                  : "campus-floorBtn"
              }
              onClick={() => setSelectedFloor("second")}
            >
              2<sup>e</sup> étage
            </button>
          </div>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-color libre"></span> Libre
          </div>
          <div className="legend-item">
            <span className="legend-color utilisee"></span> Utilisée
          </div>
        </div>
      </div>

      {/* Carte + nuage de points */}
      <div className="campus-map">
        <img
          src={currentFloor.imageSrc}
          alt={`Plan du campus - ${currentFloor.label}`}
          className="campus-image"
        />

        <div className="rooms-overlay">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="room-marker"
              style={{
                left: `${room.xPercent}%`,
                top: `${room.yPercent}%`,
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

      {/* Panneau d'info salle */}
      {selectedRoom && (
        <div className="room-info-panel">
          <div className="room-info-header">
            <h2>{selectedRoom.name}</h2>
            <button
              className="close-btn"
              onClick={() => setSelectedRoom(null)}
            >
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
              Matin :{" "}
              {selectedRoom.morning === "libre" ? "✔ Libre" : "✖ Occupée"}
            </div>
            <div>
              Après-midi :{" "}
              {selectedRoom.afternoon === "libre" ? "✔ Libre" : "✖ Occupée"}
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
