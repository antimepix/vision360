import React from "react";

export default function RoomDetails({
    room,
    editingName,
    nameInput,
    setNameInput,
    onStartRename,
    onConfirmRename,
    onCancelRename,
    onDeleteRoom,
    onClose,
    isReadOnly,
    onKeyDown
}) {
    if (!room) return null;

    return (
        <div className="room-info-panel">
            <div className="room-info-header">
                {editingName ? (
                    <div className="rename-row">
                        <input
                            className="rename-input"
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            autoFocus
                        />
                        <button className="rename-confirm-btn" onClick={onConfirmRename}>
                            ✓
                        </button>
                    </div>
                ) : (
                    <h2
                        onClick={onStartRename}
                        className={`room-title-editable ${isReadOnly ? "readonly" : ""}`}
                        title={isReadOnly ? "" : "Cliquer pour renommer"}
                    >
                        {room.displayName}
                        {!isReadOnly && <span className="edit-icon">✎</span>}
                    </h2>
                )}
                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="room-info-body">
                <div className="info-row">
                    <span className="info-label">Statut :</span>
                    <span className={`status-badge ${room.status}`}>
                        {room.status === "libre" ? "Libre" : "Utilisée"}
                    </span>
                </div>

                <h3>Horaires</h3>
                <div>
                    Matin : {room.morning === "libre" ? "Libre" : "Occupée"}
                </div>
                <div>
                    Après-midi : {room.afternoon === "libre" ? "Libre" : "Occupée"}
                </div>

                <div className="info-row">
                    <span className="info-label">ID :</span> {room.id}
                </div>
                {room.alias && (
                    <div className="info-row">
                        <span className="info-label">Nom original :</span> {room.name}
                    </div>
                )}

                {!isReadOnly && (
                    <div className="delete-row">
                        <button className="delete-room-btn" onClick={onDeleteRoom}>
                            🗑 Supprimer la salle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
