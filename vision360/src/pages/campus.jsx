import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "./campus.css";

// External Data
import campus0 from "../data/campus0.json";
import campus1 from "../data/campus1.json";
import campus2 from "../data/campus2.json";
import events from "../data/data.json";

// Utils
import { todayYMD } from "../utils/appUtils";
import { loadOverrides, saveOverrides } from "../utils/storage";
import { buildRoomData } from "../utils/roomUtils";

// Sub-components
import FloorSelector from "./campus/FloorSelector";
import RoomCard from "./campus/RoomCard";
import CampusLegend from "./campus/CampusLegend";
import RoomDetails from "./campus/RoomDetails";

const FLOOR_CONFIGS = {
  ground: { id: "ground", label: "rez de chaussee", data: campus0, imageSrc: "/RezDeChaussee.png" },
  first: { id: "first", label: "1er etage", data: campus1, imageSrc: "/premierEtage.png" },
  second: { id: "second", label: "2e etage", data: campus2, imageSrc: "/terrasse.png" },
};

export default function Campus() {
  const userRole = localStorage.getItem("userRole");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const isReadOnly = userRole === "eleve" && !isUnlocked;

  const [selectedFloor, setSelectedFloor] = useState("second");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [dragging, setDragging] = useState(null);
  const floorRef = useRef(null);
  const didDragRef = useRef(false);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const buildRooms = useCallback((floorKey) => {
    const floorConfig = FLOOR_CONFIGS[floorKey];
    const baseRooms = floorConfig?.data?.rooms ?? [];
    const overrides = loadOverrides();
    
    // Only pass today's events to the room builder
    const today = todayYMD();
    const todayEvents = events.filter(e => String(e.start || "").slice(0, 10) === today);

    return buildRoomData(baseRooms, overrides, todayEvents);
  }, []);

  useEffect(() => {
    setRooms(buildRooms(selectedFloor));
    setSelectedRoom(null);
    setEditingName(false);
  }, [selectedFloor, buildRooms]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (unlockCode.trim().toUpperCase() === "MODIF") {
      setIsUnlocked(true);
      setUnlockCode("");
    } else {
      alert("Code incorrect.");
    }
  };

  const handlePointerDown = (e, room, type = "move") => {
    if (isReadOnly) return;
    if (e.button && e.button !== 0) return;
    if (type === "resize" || type === "rotate") e.stopPropagation();
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    didDragRef.current = false;
    setDragging({
      roomId: room.id,
      type,
      startMouseX: clientX,
      startMouseY: clientY,
      startXPct: room.xPercent,
      startYPct: room.yPercent,
      startWPct: room.widthPercent,
      startHPct: room.heightPercent,
    });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragging || !floorRef.current) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = floorRef.current.getBoundingClientRect();
    const dx = clientX - dragging.startMouseX;
    const dy = clientY - dragging.startMouseY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDragRef.current = true;

    const dxPct = (dx / rect.width) * 100;
    const dyPct = (dy / rect.height) * 100;

    setRooms((prev) => prev.map((r) => {
      if (r.id !== dragging.roomId) return r;
      if (dragging.type === "move") {
        return { ...r, xPercent: Math.max(0, Math.min(100, dragging.startXPct + dxPct)), yPercent: Math.max(0, Math.min(100, dragging.startYPct + dyPct)) };
      } else if (dragging.type === "resize") {
        return { ...r, widthPercent: Math.max(2, Math.min(50, dragging.startWPct + dxPct)), heightPercent: Math.max(2, Math.min(50, dragging.startHPct + dyPct)) };
      } else if (dragging.type === "rotate") {
        // Calcul de l'angle par rapport au centre théorique (en %) converti en px
        const centerX = rect.left + (r.xPercent + r.widthPercent / 2) * rect.width / 100;
        const centerY = rect.top + (r.yPercent + r.heightPercent / 2) * rect.height / 100;
        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        return { ...r, rotation: (angle + 90) % 360 };
      }
      return r;
    }));
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setRooms((prev) => {
      const updated = prev.find((r) => r.id === dragging.roomId);
      if (updated) {
        const overrides = loadOverrides();
        overrides[updated.id] = {
          ...overrides[updated.id],
          xPercent: Math.round(updated.xPercent * 100) / 100,
          yPercent: Math.round(updated.yPercent * 100) / 100,
          widthPercent: Math.round(updated.widthPercent * 100) / 100,
          heightPercent: Math.round(updated.heightPercent * 100) / 100,
          rotation: Math.round(updated.rotation || 0),
        };
        saveOverrides(overrides);
      }
      return prev;
    });
    setDragging(null);
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();
    document.addEventListener("mousemove", onMove, { passive: false });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const handleRoomClick = (room) => {
    if (didDragRef.current) return;
    setSelectedRoom(room);
    setEditingName(false);
  };

  const handleDeleteRoom = () => {
    if (!selectedRoom || isReadOnly) return;
    if (!window.confirm(`Supprimer la salle "${selectedRoom.displayName}" ?`)) return;

    const overrides = loadOverrides();
    overrides[selectedRoom.id] = { ...overrides[selectedRoom.id], isDeleted: true };
    saveOverrides(overrides);

    setRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
    setSelectedRoom(null);
  };

  const handleAddRoom = () => {
    if (isReadOnly) return;
    const newId = `custom-${Date.now()}`;
    const overrides = loadOverrides();
    overrides[newId] = {
      isCustom: true,
      xPercent: 45,
      yPercent: 40,
      widthPercent: 12,
      heightPercent: 10,
      rotation: 0,
      alias: "Nouvelle salle",
    };
    saveOverrides(overrides);
    setRooms(buildRooms(selectedFloor)); // Recharge tout pour inclure la nouvelle salle
  };

  const confirmRename = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !selectedRoom) { setEditingName(false); return; }
    const overrides = loadOverrides();
    overrides[selectedRoom.id] = { ...overrides[selectedRoom.id], alias: trimmed };
    saveOverrides(overrides);
    setRooms((prev) => prev.map((r) => r.id === selectedRoom.id ? { ...r, alias: trimmed, displayName: trimmed } : r));
    setSelectedRoom((prev) => ({ ...prev, alias: trimmed, displayName: trimmed }));
    setEditingName(false);
  };

  const currentFloor = FLOOR_CONFIGS[selectedFloor];

  const roomList = useMemo(() => rooms.map((room) => (
    <RoomCard
      key={room.id}
      room={room}
      isDragging={dragging?.roomId === room.id && dragging.type === "move"}
      isResizing={dragging?.roomId === room.id && dragging.type === "resize"}
      isRotating={dragging?.roomId === room.id && dragging.type === "rotate"}
      isReadOnly={isReadOnly}
      onPointerDown={handlePointerDown}
      onClick={handleRoomClick}
    />
  )), [rooms, dragging, isReadOnly, handlePointerDown]);

  return (
    <div className="campus-container">
      {/* Preload hidden images */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none", opacity: 0 }}>
        {Object.values(FLOOR_CONFIGS).map(cfg => <img key={cfg.id} src={cfg.imageSrc} alt="" />)}
      </div>

      <div className="campus-header">
        <h1>Plan Interactif du Campus</h1>
        <FloorSelector selectedFloor={selectedFloor} onSelectFloor={setSelectedFloor} />
        <CampusLegend
          userRole={userRole}
          isUnlocked={isUnlocked}
          unlockCode={unlockCode}
          setUnlockCode={setUnlockCode}
          onUnlock={handleUnlock}
          onAddRoom={handleAddRoom}
          isReadOnly={isReadOnly}
        />
      </div>

      <div className="campus-layout">
        <div
          ref={floorRef}
          className="campus-floor-shape"
          style={{ backgroundImage: `url(${currentFloor.imageSrc})`, backgroundSize: "100% 100%" }}
        >
          {roomList}
        </div>
      </div>

      <RoomDetails
        room={selectedRoom}
        editingName={editingName}
        nameInput={nameInput}
        setNameInput={setNameInput}
        onStartRename={() => { if (!isReadOnly) { setEditingName(true); setNameInput(selectedRoom.alias || selectedRoom.name); } }}
        onConfirmRename={confirmRename}
        onCancelRename={() => setEditingName(false)}
        onDeleteRoom={handleDeleteRoom}
        onClose={() => setSelectedRoom(null)}
        isReadOnly={isReadOnly}
        onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setEditingName(false); }}
      />
    </div>
  );
}
