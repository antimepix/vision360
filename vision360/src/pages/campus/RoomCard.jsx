import React, { memo } from "react";

const RoomCard = memo(function RoomCard({ room, isDragging, isResizing, isReadOnly, onPointerDown, onClick }) {
    return (
        <div
            className={`room-card-positioned ${room.status}${isDragging ? " dragging" : ""}${isResizing ? " resizing" : ""}`}
            style={{
                left: `${room.xPercent}%`,
                top: `${room.yPercent}%`,
                width: `${room.widthPercent}%`,
                height: `${room.heightPercent}%`,
            }}
            onMouseDown={(e) => onPointerDown(e, room, "move")}
            onTouchStart={(e) => onPointerDown(e, room, "move")}
            onClick={() => onClick(room)}
        >
            <div className="room-name">{room.displayName}</div>

            {!isReadOnly && (
                <div
                    className="resize-handle"
                    onMouseDown={(e) => onPointerDown(e, room, "resize")}
                    onTouchStart={(e) => onPointerDown(e, room, "resize")}
                />
            )}
        </div>
    );
});

export default RoomCard;
