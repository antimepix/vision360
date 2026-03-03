import React, { memo } from "react";

const RoomCard = memo(function RoomCard({ room, isDragging, isResizing, isReadOnly, onPointerDown, onClick, onDeleteRoom }) {
    return (
        <div
            className={`room-card-positioned ${room.status}${isDragging ? " dragging" : ""}${isResizing ? " resizing" : ""}`}
            style={{
                left: `${room.xPercent}%`,
                top: `${room.yPercent}%`,
                width: `${room.widthPercent}%`,
                height: `${room.heightPercent}%`,
                transform: `rotate(${room.rotation || 0}deg)`,
                transformOrigin: "center center",
            }}
            onMouseDown={(e) => onPointerDown(e, room, "move")}
            onTouchStart={(e) => onPointerDown(e, room, "move")}
            onClick={() => onClick(room)}
        >
            <div className="room-name">{room.displayName}</div>

            {!isReadOnly && (
                <>
                    <div
                        className="rotation-handle"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onPointerDown(e, room, "rotate");
                        }}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            onPointerDown(e, room, "rotate");
                        }}
                        title="Faire pivoter"
                    />

                    <div
                        className="resize-handle"
                        onMouseDown={(e) => onPointerDown(e, room, "resize")}
                        onTouchStart={(e) => onPointerDown(e, room, "resize")}
                    />
                </>
            )}
        </div>
    );
});

export default RoomCard;
